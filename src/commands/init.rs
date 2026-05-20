use git2::{Repository, Signature};
use crate::error::SnatchResult;

pub fn exec() -> SnatchResult<()> {
    let repo = Repository::discover(".")?;
    
    let signature = Signature::now("snatch", "snatch@internal")?;
    
    // Check if snatch is already initialized
    if repo.find_reference("refs/snatch/meta").is_ok() {
        println!("snatch is already initialized in this repository.");
        return Ok(());
    }

    // Create an empty tree for the initial meta commit
    let mut index = repo.index()?;
    let tree_id = index.write_tree()?;
    let tree = repo.find_tree(tree_id)?;

    // Create a "marker" commit
    let commit_id = repo.commit(
        Some("refs/snatch/meta"),
        &signature,
        &signature,
        "snatch: initialize meta",
        &tree,
        &[],
    )?;

    println!("Initialized snatch in repository: {:?}", repo.path());
    println!("Marker created at refs/snatch/meta ({})", commit_id);

    // Create default config file if not exists
    if !std::path::Path::new(".snatch.toml").exists() {
        crate::config::Config::save_default()?;
        println!("Created default configuration file at .snatch.toml");
    }

    Ok(())
}
