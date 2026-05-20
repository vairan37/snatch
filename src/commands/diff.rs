use git2::{Repository, DiffOptions};
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

    // 4. Generate diff between the snapshot tree and the working directory
    let mut opts = DiffOptions::new();
    opts.include_untracked(true);
    opts.recurse_untracked_dirs(true);

    let diff = repo.diff_tree_to_workdir_with_index(Some(&tree), Some(&mut opts))?;

    // 5. Print the diff to stdout
    diff.print(git2::DiffFormat::Patch, |_delta, _hunk, line| {
        use std::io::{self, Write};
        let origin = line.origin();
        match origin {
            '+' | '-' | ' ' => print!("{}", origin),
            _ => {}
        }
        let _ = io::stdout().write_all(line.content());
        true
    })?;

    Ok(())
}
