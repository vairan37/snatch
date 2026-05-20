use git2::{Repository, Signature, IndexAddOption};
use crate::git::snapshot::Snapshot;
use crate::git::refs;
use crate::error::{SnatchResult, SnatchError};

pub fn exec(message: String) -> SnatchResult<()> {
    let repo = Repository::discover(".")?;
    
    // 1. Get current branch name
    let head = repo.head()?;
    let branch_name = head.shorthand().map_err(|_| SnatchError::BranchError("Could not determine current branch".into()))?;

    // 2. Prepare signature
    let signature = Signature::now("snatch", "snatch@internal")?;

    // 3. Update index with all changes (like git add .)
    let mut index = repo.index()?;
    index.add_all(["*"].iter(), IndexAddOption::DEFAULT, None)?;
    index.write()?;
    let tree_id = index.write_tree()?;
    let tree = repo.find_tree(tree_id)?;

    // 4. Create the Snapshot metadata
    let mut snapshot = Snapshot::new(message.clone(), branch_name.to_string(), String::new());
    let ref_name = refs::build_ref_name(branch_name, &snapshot.id.to_string());
    snapshot.ref_name = ref_name.clone();

    // 5. Create the Git commit
    let serialized_snapshot = serde_json::to_string(&snapshot)?;
    let commit_message = format!("{}\n\nSNATCH_METADATA:{}", message, serialized_snapshot);

    let commit_oid = repo.commit(
        Some(&ref_name),
        &signature,
        &signature,
        &commit_message,
        &tree,
        &[],
    )?;

    println!("Snapshot saved: {}", snapshot.id);
    println!("Reference: {}", ref_name);
    println!("Commit: {}", commit_oid);

    Ok(())
}
