use std::fs;
use std::process::Command;
use tempfile::tempdir;
use git2::{Repository, Signature};

#[test]
fn test_snatch_lifecycle() {
    let dir = tempdir().expect("Failed to create temp dir");
    let path = dir.path();
    let bin_path = env!("CARGO_BIN_EXE_snatch");

    // 1. Initialize a Git repo
    let repo = Repository::init(path).expect("Failed to init git repo");
    let signature = Signature::now("test", "test@example.com").expect("Failed to create signature");
    
    // Create an initial commit so HEAD exists
    {
        let mut index = repo.index().expect("Failed to get index");
        fs::write(path.join("README.md"), "initial content").expect("Failed to write file");
        index.add_path(std::path::Path::new("README.md")).expect("Failed to add file");
        index.write().expect("Failed to write index");
        let tree_id = index.write_tree().expect("Failed to write tree");
        let tree = repo.find_tree(tree_id).expect("Failed to find tree");
        repo.commit(Some("HEAD"), &signature, &signature, "initial commit", &tree, &[]).expect("Failed to commit");
    }

    // 2. Run snatch init
    let status = Command::new(bin_path)
        .arg("init")
        .current_dir(path)
        .status()
        .expect("Failed to run snatch init");
    assert!(status.success());

    // 3. Make changes and snatch save
    fs::write(path.join("feature.txt"), "awesome feature").expect("Failed to write feature");
    let status = Command::new(bin_path)
        .args(&["save", "first snap"])
        .current_dir(path)
        .status()
        .expect("Failed to run snatch save");
    assert!(status.success());

    // 4. Snatch list to get the ID
    let output = Command::new(bin_path)
        .arg("list")
        .current_dir(path)
        .output()
        .expect("Failed to run snatch list");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("first snap"));
    
    // Extract ID from the first line of snapshots (third line of output after headers)
    let lines: Vec<&str> = stdout.lines().collect();
    let snap_line = lines.iter().find(|l| l.contains("first snap")).expect("Could not find snapshot in list");
    let snap_id = snap_line.split('|').next().expect("Could not find ID column").trim();

    // 5. Delete the file and snatch restore
    fs::remove_file(path.join("feature.txt")).expect("Failed to remove file");
    assert!(!path.join("feature.txt").exists());

    let status = Command::new(bin_path)
        .args(&["restore", snap_id])
        .current_dir(path)
        .status()
        .expect("Failed to run snatch restore");
    assert!(status.success());

    // Verify restoration
    assert!(path.join("feature.txt").exists());
    let content = fs::read_to_string(path.join("feature.txt")).expect("Failed to read restored file");
    assert_eq!(content, "awesome feature");
}
