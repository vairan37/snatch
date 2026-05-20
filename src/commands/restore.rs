use git2::Repository;
use git2::build::CheckoutBuilder;
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

    // 3. Get the commit and its tree
    let reference = repo.find_reference(target_ref)?;
    let commit = reference.peel_to_commit()?;
    let tree = commit.tree()?;

    // 4. Checkout the tree to the working directory
    let mut checkout_opts = CheckoutBuilder::new();
    checkout_opts.force(); // Overwrite local changes
    repo.checkout_tree(tree.as_object(), Some(&mut checkout_opts))?;

    // 5. Update index to match the restored tree
    let mut index = repo.index()?;
    index.read_tree(&tree)?;
    index.write()?;

    println!("Restored workspace to snapshot: {}", target_ref);

    Ok(())
}
