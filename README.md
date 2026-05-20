# snatch

> Lightweight Git snapshot manager for AI-assisted development sessions.

![snatch demo](https://via.placeholder.com/800x400.png?text=Snatch+CLI+Demo+Animation)

## The Problem

When working with AI coding assistants (Claude Code, Cursor, Copilot, Aider...), rapid iteration is the norm. Prompts can introduce brilliant features or break your codebase mid-thought. Standard Git commits are too heavy and rigid for this workflow — you don't want to pollute your commit history with half-baked, broken states, but you absolutely need a safety net before firing off a risky prompt.

`snatch` solves this by introducing **sub-commits**: lightweight, invisible snapshots of your workspace that live outside your main Git history.

## The Solution

`snatch` allows you to capture your workspace state instantly, list your snapshots, review changes, and restore them — all without touching your real Git history or polluting `git log`. 

When you reach a stable state, you can squash all your invisible snapshots into a single, clean Git commit.

## Installation

Currently, `snatch` is available via Cargo.

```bash
cargo install --path .
```

## Quick Start

Initialize `snatch` in your existing Git repository:

```bash
snatch init
```

Take a snapshot before asking your AI assistant to refactor the auth module:

```bash
snatch save "before auth refactor"
```

If the AI hallucinated and broke the code, view your snapshots:

```bash
snatch list
```
```text
Snapshots for session: feature/auth
----------------------------------------------------------------------------------------------------
ID       | Timestamp                 | Message
----------------------------------------------------------------------------------------------------
117fdc5b | 2026-05-20 22:20:44       | before auth refactor
```

Check what changed since the snapshot:

```bash
snatch diff 117fdc5b
```

Restore the clean state:

```bash
snatch restore 117fdc5b
```

Once you're happy with a feature, consolidate your session into a real Git commit:

```bash
# Opens your $EDITOR with the squashed snapshot messages as context
snatch squash

# Or provide a message directly
snatch squash "feat(auth): complete auth refactor using JWT"
```

## Commands

| Command | Description |
| :--- | :--- |
| `snatch init` | Initializes snatch in the current Git repository. Creates a meta marker. |
| `snatch save <message>` | Captures the current workspace state (including untracked files) as a snapshot. |
| `snatch list` | Lists all snapshots for the current working branch (session). |
| `snatch diff <id>` | Shows the patch difference between your working directory and the specified snapshot. |
| `snatch restore <id>` | Hard resets your workspace to the exact state of the snapshot. |
| `snatch drop <id>` | Deletes a specific snapshot from the session history. |
| `snatch squash [message]` | Merges all session snapshots into a single standard Git commit and cleans up the session. If `message` is omitted, opens `$EDITOR` for interactive commit message writing. |

*Note: You only need to provide the first few characters of a snapshot ID for `diff`, `restore`, and `drop`.*

## How it Works

`snatch` is not a wrapper around `git stash` or a new version control system. It uses **native Git internals** to provide maximum compatibility and performance.

When you run `snatch save`, it creates a real Git commit containing your current index and working directory. However, instead of attaching this commit to your branch history (`refs/heads/*`), it saves it under a hidden, custom reference namespace:

```
refs/snatch/sessions/<branch-name>/<uuid>
```

- **Invisible:** These commits do not show up in `git log`, `git status`, or standard Git GUI clients.
- **Isolated:** They are "orphan" commits, meaning they don't alter your branch graph.
- **Portable:** They are valid Git objects and are stored directly within your `.git` folder. No external databases or sidecar files are required.

## Configuration

When initialized, `snatch` creates a `.snatch.toml` file in the root of your project. You can customize the display format:

```toml
[session]
name_template = "{branch}-{date}"

[display]
date_format = "%Y-%m-%d %H:%M:%S"
show_id_full = false # Set to true to see full UUIDs instead of 8-char prefixes
```

## Roadmap

### Phase 1: CLI MVP (Done)
- Core Git integration using `git2`
- `init`, `save`, `list`, `restore`, `diff`, `drop`, `squash`
- Robust error handling and TOML configuration

### Phase 2: CLI Enhancements
- Interactive TUI for snapshot selection (via `dialoguer` or `inquire`)
- Session management (switching between sessions independently of branches)
- Push/Pull support for remote snapshot syncing

### Phase 3: Desktop UI
- Tauri + React desktop application wrapping the CLI
- Visual snapshot timeline graph
- 1-click visual restore and side-by-side diff viewer
- Direct integrations with tools like Cursor and Claude Code

---
*Built with Rust and libgit2.*
