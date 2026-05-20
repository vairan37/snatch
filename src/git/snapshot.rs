use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub id: Uuid,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub branch: String,
    pub ref_name: String,
}

impl Snapshot {
    pub fn new(message: String, branch: String, ref_name: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            message,
            timestamp: Utc::now(),
            branch,
            ref_name,
        }
    }

    pub fn from_commit(commit: &git2::Commit) -> Option<Self> {
        let message = commit.message().into_iter().next()?;
        let marker = "SNATCH_METADATA:";
        if let Some(index) = message.find(marker) {
            let json_str = &message[index + marker.len()..];
            serde_json::from_str(json_str.trim()).ok()
        } else {
            None
        }
    }
}
