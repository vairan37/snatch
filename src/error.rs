use thiserror::Error;

#[derive(Error, Debug)]
pub enum SnatchError {
    #[error("Git error: {0}")]
    Git(#[from] git2::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Snapshot not found: {0}")]
    SnapshotNotFound(String),

    #[error("Branch error: {0}")]
    BranchError(String),

    #[error("General error: {0}")]
    General(String),
}

pub type SnatchResult<T> = std::result::Result<T, SnatchError>;
