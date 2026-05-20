use git2::{Repository, Signature, IndexAddOption};
use std::error::Error;
use crate::git::snapshot::Snapshot;
use crate::git::refs;

pub fn exec(message: String) -> Result<(), Box<dyn Error>> {
    let repo = Repository::discover(".")?;
    
    // 1. Get current branch name
    let head = repo.head()?;
    let branch_name = head.shorthand().unwrap_or("unknown");

    // 2. Prepare signature
    let signature = Signature::now("snatch", "snatch@internal")?;

    // 3. Update index with all changes (like git add .)
    let mut index = repo.index()?;
    index.add_all(["*"].iter(), IndexAddOption::DEFAULT, None)?;
    index.write()?;
    let tree_id = index.write_tree()?;
    let tree = repo.find_tree(tree_id)?;

    // 4. Create the Snapshot metadata
    // We use a temporary ID to build the ref name, then we'll update it if needed
    let mut snapshot = Snapshot::new(message.clone(), branch_name.to_string(), String::new());
    let ref_name = refs::build_ref_name(branch_name, &snapshot.id.to_string());
    snapshot.ref_name = ref_name.clone();

    // 5. Create the Git commit
    // We serialize the snapshot metadata into the commit message or keep it as a separate record?
    // Architecture says: Snapshots are stored as real Git commits under a hidden ref namespace.
    // Let's store the serialized JSON in the commit message body for simplicity and portability.
    let serialized_snapshot = serde_json::to_string(&snapshot)?;
    let commit_message = format!("{}\n\nSNATCH_METADATA:{}", message, serialized_snapshot);

    let commit_oid = repo.commit(
        Some(&ref_name),
        &signature,
        &signature,
        &commit_message,
        &tree,
        &[], // No parents for snapshots to keep them isolated? 
             // Or should they follow HEAD? Architecture says "sub-commits ... outside main history".
             // Keeping them as orphans or children of the last snapshot in the session?
             // For MVP, orphans are easiest to manage and don't pollute the graph.
    )?;

    println!("Snapshot saved: {}", snapshot.id);
    println!("Reference: {}", ref_name);
    println!("Commit: {}", commit_oid);

    Ok(())
}
