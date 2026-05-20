mod commands;
mod git;
mod session;
mod error;
mod config;

use clap::{Parser, Subcommand};
use config::Config;

#[derive(Parser)]
#[command(name = "snatch")]
#[command(about = "Lightweight Git snapshot manager", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize snatch in the current repository
    Init,
    /// Capture current workspace state
    Save {
        /// Snapshot message
        message: String,
    },
    /// List all snapshots for the current session
    List,
    /// Show diff since snapshot <id>
    Diff {
        /// Snapshot ID (or prefix)
        id: String,
    },
    /// Delete a snapshot
    Drop {
        /// Snapshot ID (or prefix)
        id: String,
    },
    /// Restore workspace to snapshot <id>
    Restore {
        /// Snapshot ID (or prefix)
        id: String,
    },
    /// Merge all snapshots into a real Git commit and cleanup
    Squash {
        /// Optional commit message
        message: Option<String>,
    },
}

fn main() {
    let cli = Cli::parse();
    let config = Config::load();

    let result = match &cli.command {
        Commands::Init => commands::init::exec(),
        Commands::Save { message } => commands::save::exec(message.clone()),
        Commands::List => commands::list::exec(config),
        Commands::Diff { id } => commands::diff::exec(id.clone()),
        Commands::Drop { id } => commands::drop::exec(id.clone()),
        Commands::Restore { id } => commands::restore::exec(id.clone()),
        Commands::Squash { message } => commands::squash::exec(message.clone()),
    };


    if let Err(e) = result {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
