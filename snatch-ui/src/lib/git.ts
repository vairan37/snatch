import { Command } from "@tauri-apps/plugin-shell";

export interface GitStatus {
  branch: string;
  isClean: boolean;
  raw: string;
}

export interface GitLogEntry {
  hash: string;
  author: string;
  date: string;
  message: string;
}

/**
 * Since our 'snatch' CLI sidecar doesn't have native git passthrough yet,
 * we'll use it to execute standard git commands if we need to, 
 * or we can add a 'git' subcommand to 'snatch' later.
 * 
 * For now, we'll assume we can run standard 'git' via the shell plugin
 * if it's allowed in our capabilities.
 */

async function runGit(args: string[]): Promise<string> {
  const command = new Command("git", args);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `git ${args[0]} failed`);
  }
  return output.stdout;
}

export async function getGitStatus(): Promise<GitStatus> {
  const stdout = await runGit(["status", "--branch", "--short"]);
  const lines = stdout.split('\n');
  const branchLine = lines[0] || "";
  const branch = branchLine.replace('## ', '').split('...')[0].trim();
  const isClean = lines.length <= 2 && lines[1] === "";

  return {
    branch,
    isClean,
    raw: stdout
  };
}

export async function getBranches(): Promise<string[]> {
  const stdout = await runGit(["branch", "--format=%(refname:short)"]);
  return stdout.split('\n').map(b => b.trim()).filter(b => b !== "");
}

export async function getGitLog(limit: number = 10): Promise<GitLogEntry[]> {
  const stdout = await runGit([
    "log", 
    `-${limit}`, 
    "--format=%H|%an|%ad|%s", 
    "--date=short"
  ]);
  
  return stdout.split('\n').filter(l => l.trim() !== "").map(line => {
    const [hash, author, date, message] = line.split('|');
    return { hash, author, date, message };
  });
}
