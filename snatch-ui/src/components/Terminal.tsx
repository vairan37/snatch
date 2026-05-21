import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Command } from '@tauri-apps/plugin-shell';
import '@xterm/xterm/css/xterm.css';

const TerminalComponent: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#1a1b1e',
        foreground: '#e2e2e2',
        cursor: '#00ff88',
        selectionBackground: '#00ff8822',
        black: '#1a1b1e',
        red: '#ff5555',
        green: '#00ff88',
        yellow: '#ffb86c',
        blue: '#8be9fd',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#e2e2e2',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    // Initial fit
    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = term;

    // Spawn shell
    let shell = "bash";
    if (navigator.userAgent.includes("Windows")) {
      shell = "cmd.exe";
    }

    const startShell = async () => {
      try {
        const command = Command.create(shell);
        
        // Use any to bypass TS errors if necessary, but trying standard way
        (command as any).stdout.on('data', (data: string) => term.write(data));
        (command as any).stderr.on('data', (data: string) => term.write(`\x1b[31m${data}\x1b[0m`));
        
        const child = await command.spawn();
        
        term.onData(data => {
          child.write(data).catch(err => term.write(`\r\n[Write Error] ${err}\r\n`));
        });

        term.writeln(`\x1b[1;32mS N A T C H\x1b[0m terminal ready (${shell})`);
      } catch (err) {
        term.writeln(`\r\nFailed to start shell: ${err}`);
      }
    };

    startShell();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div ref={terminalRef} className="w-full h-full bg-[#1a1b1e] p-2" />
  );
};

export default TerminalComponent;
