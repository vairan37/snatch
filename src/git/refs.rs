use git2::{Repository, Oid};
use std::error::Error;

pub const REFS_PREFIX: &str = "refs/snatch/sessions";

/// Construct a reference name for a specific snapshot
pub fn build_ref_name(branch: &str, snapshot_id: &str) -> String {
    format!("{}/{}/{}", REFS_PREFIX, branch, snapshot_id)
}

/// Write a reference for a snapshot
pub fn write_ref(
    repo: &Repository,
    branch: &str,
    snapshot_id: &str,
    commit_oid: Oid,
) -> Result<String, Box<dyn Error>> {
    let ref_name = build_ref_name(branch, snapshot_id);
    repo.reference(&ref_name, commit_oid, true, "snatch: save snapshot")?;
    Ok(ref_name)
}

/// List all snapshot references for a given branch
pub fn list_refs(repo: &Repository, branch: &str) -> Result<Vec<String>, Box<dyn Error>> {
    let prefix = format!("{}/{}/", REFS_PREFIX, branch);
    let mut refs = Vec::new();

    for reference_result in repo.references_glob(&format!("{}*", prefix))? {
        let reference = reference_result?;
        if let Ok(name) = reference.name_bytes().try_into().map(std::str::from_utf8) {
             if let Ok(name_str) = name {
                refs.push(name_str.to_string());
             }
        }
    }

    Ok(refs)
}

/// Delete a snapshot reference
pub fn delete_ref(repo: &Repository, ref_name: &str) -> Result<(), Box<dyn Error>> {
    let mut reference = repo.find_reference(ref_name)?;
    reference.delete()?;
    Ok(())
}
