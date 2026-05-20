# snatch

> Lightweight Git snapshot manager for AI-assisted development sessions.

## Problem

When working with AI coding assistants (Claude Code, Cursor, Copilot…), you often iterate rapidly with prompts that can break your codebase mid-feature. Git commits are too heavy for this workflow — you don't want to pollute your history with half-baked states, but you still need a safety net before each prompt.

`snatch` solves this by introducing **sub-commits**: lightweight, invisible snapshots of your workspace that live outside your main Git history.

---

## Solution

`snatch` lets you capture your workspace state at any point during a session, list your snapshots, diff them, and restore any of them instantly — without touching your real Git history.

When you're happy with the result, squash all snaps into a single clean commit.

---

## Core Commands

```bash
snatch init                        # Initialize snatch in the current Git repo
snatch save "before auth refactor" # Capture current workspace state
snatch list                        # List all snapshots for current session
snatch diff <id>                   # Show diff since snapshot <id>
snatch restore <id>                # Roll back workspace to snapshot <id>
snatch drop <id>                   # Delete a snapshot
snatch squash                      # Merge all snaps into a real Git commit
```

---

## Architecture

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| CLI core | Rust | Performance, standalone binary, ecosystem (git2, clap) |
| Git integration | `git2` (libgit2 bindings) | Native Git operations |
| CLI parsing | `clap` v4 | Standard Rust CLI framework |
| Serialization | `serde` + `serde_json` | Config and metadata |
| UI (phase 2) | Tauri + React | Wraps the CLI binary, lightweight vs Electron |

### Snapshot Storage

Snapshots are stored as real Git commits under a hidden ref namespace:

```
refs/snatch/sessions/<session-id>/<snapshot-id>
```

- Invisible to `git log`, `git status`, and standard Git tooling
- Portable (follow the repo if cloned)
- No external files or databases required
- Clean removal: `git update-ref -d refs/snatch/...`

### Session Model

A **session** is a group of snapshots tied to a working branch. Sessions are identified by `<branch-name>-<date>`.

```
Session: main-2024-01-15
  snap/001 — "initial state"
  snap/002 — "before auth refactor"
  snap/003 — "before adding middleware"
```

---

## Project Structure

```
snatch/
├── Cargo.toml
├── src/
│   ├── main.rs          # CLI entry point (clap)
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── init.rs
│   │   ├── save.rs
│   │   ├── list.rs
│   │   ├── diff.rs
│   │   ├── restore.rs
│   │   ├── drop.rs
│   │   └── squash.rs
│   ├── git/
│   │   ├── mod.rs       # Git operations (git2 wrapper)
│   │   ├── refs.rs      # refs/snatch/* management
│   │   └── snapshot.rs  # Snapshot struct + serialization
│   └── session/
│       ├── mod.rs
│       └── manager.rs   # Session lifecycle
├── tests/
│   └── integration/
└── GEMINI.md
```

---

## MVP Scope (Phase 1)

Focus on 3 commands only:

- `snatch save` — capture workspace state
- `snatch list` — display snapshots
- `snatch restore` — roll back to a snapshot

This covers 90% of the core use case and validates the workflow before building further.

---

## Roadmap

### Phase 1 — CLI MVP
- [ ] `snatch init`
- [ ] `snatch save`
- [ ] `snatch list`
- [ ] `snatch restore`

### Phase 2 — CLI Complete
- [ ] `snatch diff`
- [ ] `snatch drop`
- [ ] `snatch squash`
- [ ] Session management
- [ ] Config file (`.snatch.toml`)

### Phase 3 — UI
- [ ] Tauri desktop app
- [ ] Visual snapshot timeline
- [ ] One-click restore
- [ ] Diff viewer
- [ ] Integration with Claude Code / Cursor workflows

---

## Non-Goals

- Not a replacement for Git branches
- Not a full Git client
- Not cloud sync (local only, at least in v1)
- Not AI-specific (works with any workflow, but designed with AI sessions in mind)

---

## Inspiration

- **Git Butler** — virtual branches UI, Tauri + Rust architecture
- **Jujutsu (jj)** — stackable changes model
- **git stash** — the problem it solves, not how it solves it
