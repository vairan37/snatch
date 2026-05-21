import { Command } from "@tauri-apps/plugin-shell";

export interface Snapshot {
  id: string;
  timestamp: string;
  message: string;
}

export async function snatchInit(): Promise<void> {
  const command = Command.sidecar("binaries/snatch", ["init"]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch init failed with code ${output.code}`);
  }
}

export async function snatchSave(message: string): Promise<void> {
  const command = Command.sidecar("binaries/snatch", ["save", message]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch save failed with code ${output.code}`);
  }
}

export async function snatchList(): Promise<Snapshot[]> {
  const command = Command.sidecar("binaries/snatch", ["list"]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch list failed with code ${output.code}`);
  }

  // Basic parsing of the table output from our CLI
  const lines = output.stdout.split('\n');
  const snapshots: Snapshot[] = [];
  
  // Skip headers (3 lines) and footer
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('---')) continue;
    
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      snapshots.push({
        id: parts[0],
        timestamp: parts[1],
        message: parts[2]
      });
    }
  }
  
  return snapshots;
}

export async function snatchDiff(id: string): Promise<string> {
  const command = Command.sidecar("binaries/snatch", ["diff", id]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch diff failed with code ${output.code}`);
  }
  return output.stdout;
}

export async function snatchRestore(id: string): Promise<void> {
  const command = Command.sidecar("binaries/snatch", ["restore", id]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch restore failed with code ${output.code}`);
  }
}

export async function snatchDrop(id: string): Promise<void> {
  const command = Command.sidecar("binaries/snatch", ["drop", id]);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch drop failed with code ${output.code}`);
  }
}

export async function snatchSquash(message?: string): Promise<void> {
  const args = ["squash"];
  if (message) args.push(message);
  
  const command = Command.sidecar("binaries/snatch", args);
  const output = await command.execute();
  if (output.code !== 0) {
    throw new Error(output.stderr || `snatch squash failed with code ${output.code}`);
  }
}
