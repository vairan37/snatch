use git2::Repository;
use crate::git::refs;
use crate::error::{SnatchResult, SnatchError};

pub fn exec(snapshot_id: String) -> SnatchResult<()> {
    let repo = Repository::discover(".")?;
    
    // 1. Get current branch name
    let head = repo.head()?;
    let branch_name = head.shorthand().map_err(|_| SnatchError::BranchError("Could not determine current branch".into()))?;

    // 2. Find the reference for the given ID (or prefix)
    let snapshot_refs = refs::list_refs(&repo, branch_name)?;
    let target_ref = snapshot_refs.iter()
        .find(|r| r.contains(&snapshot_id))
        .ok_or_else(|| SnatchError::SnapshotNotFound(snapshot_id))?;

    // 3. Delete the reference
    refs::delete_ref(&repo, target_ref)?;

    println!("Snapshot dropped: {}", target_ref);

    Ok(())
}
