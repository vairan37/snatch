import { Snapshot } from "./snatch";
import { GitStatus, GitLogEntry } from "./git";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateContextPrompt(
  status: GitStatus | null,
  log: GitLogEntry[],
  snapshots: Snapshot[]
): Promise<string> {
  let context = "You are an AI assistant integrated into 'snatch', a lightweight Git snapshot manager.\n";
  context += "Here is the current state of the user's repository to help you provide context-aware assistance:\n\n";

  if (status) {
    context += `## Current Branch: ${status.branch}\n`;
    context += `## Workspace Status:\n${status.raw}\n\n`;
  }

  if (snapshots.length > 0) {
    context += `## Snatch Session Snapshots (Latest first):\n`;
    snapshots.slice(0, 5).forEach(s => {
      context += `- [${s.id.substring(0, 8)}] ${s.message} (${new Date(s.timestamp).toLocaleString()})\n`;
    });
    context += "\n";
  }

  if (log.length > 0) {
    context += `## Recent Git Commits:\n`;
    log.slice(0, 5).forEach(c => {
      context += `- ${c.hash.substring(0, 7)}: ${c.message} (${c.author}, ${c.date})\n`;
    });
    context += "\n";
  }

  context += "The user is working on a development session. Use this information to answer questions about their changes, suggest snapshot messages, or help debug based on the current diffs.";

  return context;
}
