mod commands;
mod git;
mod session;

use clap::{Parser, Subcommand};

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
}

fn main() {
    let cli = Cli::parse();

    let result = match &cli.command {
        Commands::Init => commands::init::exec(),
        Commands::Save { message } => commands::save::exec(message.clone()),
    };

    if let Err(e) = result {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
