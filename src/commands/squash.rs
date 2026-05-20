use git2::Repository;

use std::fs;

use std::process::Command;
use crate::git::refs;
use crate::git::snapshot::Snapshot;
use crate::error::{SnatchResult, SnatchError};

pub fn exec(optional_message: Option<String>) -> SnatchResult<()> {
    let repo = Repository::discover(".")?;
    
    // 1. Get current branch name and HEAD commit
    let head = repo.head()?;
    let branch_name = head.shorthand().map_err(|_| SnatchError::BranchError("Could not determine current branch".into()))?;
    let head_commit = head.peel_to_commit()?;

    // 2. List all snapshots for this branch
    let snapshot_refs = refs::list_refs(&repo, branch_name)?;
    if snapshot_refs.is_empty() {
        println!("No snapshots found to squash for branch '{}'", branch_name);
        return Ok(());
    }

    // 3. Retrieve all snapshots to build the squash message context
    let mut snapshots = Vec::new();
    for ref_name in &snapshot_refs {
        let reference = repo.find_reference(ref_name)?;
        let commit = reference.peel_to_commit()?;
        if let Some(snapshot) = Snapshot::from_commit(&commit) {
            snapshots.push(snapshot);
        }
    }
    snapshots.sort_by_key(|s| s.timestamp);

    // 4. Determine final commit message
    let final_message = match optional_message {
        Some(msg) => msg,
        None => {
            // Build the context for the editor
            let mut context = String::from("\n# Please enter the commit message for your snapshots.\n# Lines starting with '#' will be ignored.\n#\n# Snapshots squashed:\n");
            for snapshot in &snapshots {
                context.push_str(&format!("# - {}\n", snapshot.message));
            }

            // Create temporary file
            let temp_file = tempfile::NamedTempFile::new()?;
            let temp_path = temp_file.path();
            fs::write(temp_path, context)?;

            // Open editor
            let editor = std::env::var("EDITOR").unwrap_or_else(|_| "vi".to_string());
            let status = Command::new(editor)
                .arg(temp_path)
                .status()
                .map_err(|e| SnatchError::General(format!("Failed to open editor: {}", e)))?;

            if !status.success() {
                return Err(SnatchError::General("Editor exited with non-zero status".into()));
            }

            // Read the file back
            let content = fs::read_to_string(temp_path)?;
            
            // Clean the message (remove comments and trailing whitespace)
            let cleaned_message: String = content.lines()
                .filter(|line| !line.starts_with('#'))
                .collect::<Vec<_>>()
                .join("\n")
                .trim()
                .to_string();

            if cleaned_message.is_empty() {
                return Err(SnatchError::General("Empty commit message, aborting squash".into()));
            }
            cleaned_message
        }
    };

    // 5. Get the tree from the LATEST snapshot (final state)
    let latest_snapshot = snapshots.last().ok_or_else(|| SnatchError::General("No snapshots found".into()))?;
    let latest_ref_name = snapshot_refs.iter()
        .find(|r| r.contains(&latest_snapshot.id.to_string()))
        .ok_or_else(|| SnatchError::General("Latest snapshot ref not found".into()))?;
    
    let latest_reference = repo.find_reference(latest_ref_name)?;
    let latest_commit = latest_reference.peel_to_commit()?;
    let latest_tree = latest_commit.tree()?;

    // 6. Create the real Git commit on the current branch
    let signature = repo.signature()?; // Use user's real Git signature
    let commit_oid = repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        &final_message,
        &latest_tree,
        &[&head_commit],
    )?;

    println!("Successfully squashed {} snapshots into commit: {}", snapshots.len(), commit_oid);

    // 7. Cleanup: Delete all snatch refs for this session
    for ref_name in snapshot_refs {
        refs::delete_ref(&repo, &ref_name)?;
    }
    println!("Session snapshots cleaned up.");

    Ok(())
}
