use git2::Repository;
use crate::error::SnatchResult;

pub const REFS_PREFIX: &str = "refs/snatch/sessions";

/// Construct a reference name for a specific snapshot
pub fn build_ref_name(branch: &str, snapshot_id: &str) -> String {
    format!("{}/{}/{}", REFS_PREFIX, branch, snapshot_id)
}

/// List all snapshot references for a given branch
pub fn list_refs(repo: &Repository, branch: &str) -> SnatchResult<Vec<String>> {
    let prefix = format!("{}/{}/", REFS_PREFIX, branch);
    let mut refs = Vec::new();

    for reference_result in repo.references_glob(&format!("{}*", prefix))? {
        let reference = reference_result?;
        if let Ok(name_str) = reference.name().map_err(|_| git2::Error::from_str("Invalid reference name")) {
             refs.push(name_str.to_string());
        }
    }

    Ok(refs)
}

/// Delete a snapshot reference
pub fn delete_ref(repo: &Repository, ref_name: &str) -> SnatchResult<()> {
    let mut reference = repo.find_reference(ref_name)?;
    reference.delete()?;
    Ok(())
}
