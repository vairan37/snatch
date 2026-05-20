use git2::Repository;
use crate::git::refs;
use crate::git::snapshot::Snapshot;
use crate::error::{SnatchResult, SnatchError};
use crate::config::Config;

pub fn exec(config: Config) -> SnatchResult<()> {
    let repo = Repository::discover(".")?;
    
    // 1. Get current branch name
    let head = repo.head()?;
    let branch_name = head.shorthand().map_err(|_| SnatchError::BranchError("Could not determine current branch".into()))?;

    // 2. List references for this branch
    let snapshot_refs = refs::list_refs(&repo, branch_name)?;

    if snapshot_refs.is_empty() {
        println!("No snapshots found for session on branch '{}'", branch_name);
        return Ok(());
    }

    println!("Snapshots for session: {}", branch_name);
    println!("{:-<100}", "");
    
    let id_width = if config.display.show_id_full { 38 } else { 8 };
    println!("{:<width$} | {:<25} | {}", "ID", "Timestamp", "Message", width = id_width);
    println!("{:-<100}", "");

    let mut snapshots = Vec::new();

    for ref_name in snapshot_refs {
        let reference = repo.find_reference(&ref_name)?;
        let commit = reference.peel_to_commit()?;
        
        if let Some(snapshot) = Snapshot::from_commit(&commit) {
            snapshots.push(snapshot);
        }
    }

    // Sort by timestamp (ascending)
    snapshots.sort_by_key(|s| s.timestamp);

    for snapshot in snapshots {
        let id_str = if config.display.show_id_full {
            snapshot.id.to_string()
        } else {
            snapshot.id.to_string()[..8].to_string()
        };

        println!(
            "{:<width$} | {:<25} | {}",
            id_str,
            snapshot.timestamp.format(&config.display.date_format).to_string(),
            snapshot.message,
            width = id_width
        );
    }

    Ok(())
}
