use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use crate::error::SnatchResult;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    #[serde(default)]
    pub session: SessionConfig,
    #[serde(default)]
    pub display: DisplayConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionConfig {
    pub name_template: String,
}

impl Default for SessionConfig {
    fn default() -> Self {
        Self {
            name_template: "{branch}-{date}".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplayConfig {
    pub date_format: String,
    pub show_id_full: bool,
}

impl Default for DisplayConfig {
    fn default() -> Self {
        Self {
            date_format: "%Y-%m-%d %H:%M:%S".to_string(),
            show_id_full: false,
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            session: SessionConfig::default(),
            display: DisplayConfig::default(),
        }
    }
}

impl Config {
    pub fn load() -> Self {
        let config_path = Path::new(".snatch.toml");
        if config_path.exists() {
            if let Ok(content) = fs::read_to_string(config_path) {
                match toml::from_str::<Config>(&content) {
                    Ok(config) => return config,
                    Err(e) => eprintln!("Warning: Failed to parse .snatch.toml: {}", e),
                }
            }
        }
        Config::default()
    }

    pub fn save_default() -> SnatchResult<()> {
        let config = Config::default();
        let content = toml::to_string_pretty(&config).unwrap();
        fs::write(".snatch.toml", content)?;
        Ok(())
    }
}
