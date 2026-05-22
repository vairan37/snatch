import React, { useState, useEffect } from 'react';
import { FolderOpen, History, PlusCircle, ArrowRight, MousePointer2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { loadSettings, saveSettings } from '../lib/settings';

interface WelcomeScreenProps {
  onProjectSelected: (path: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onProjectSelected }) => {
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [manualPath, setManualPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadSettings().then(s => setRecentProjects(s.recentProjects));

    // Drag and Drop listener from Tauri
    const unlisten = getCurrentWindow().listen<{ paths: string[] }>('tauri://drag-drop', (event) => {
      setIsDragging(false);
      const paths = event.payload.paths;
      if (paths && paths.length > 0) {
        selectProject(paths[0]);
      }
    });

    const unlistenOver = getCurrentWindow().listen('tauri://drag-over', () => {
      setIsDragging(true);
    });

    const unlistenLeave = getCurrentWindow().listen('tauri://drag-leave', () => {
      setIsDragging(false);
    });

    return () => {
      unlisten.then(f => f());
      unlistenOver.then(f => f());
      unlistenLeave.then(f => f());
    };
  }, []);

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository"
      });

      if (selected && typeof selected === 'string') {
        setManualPath(selected);
        await selectProject(selected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPath.trim()) {
      selectProject(manualPath.trim());
    }
  };

  const selectProject = async (path: string) => {
    setLoading(true);
    try {
      const settings = await loadSettings();
      const updatedRecents = [path, ...settings.recentProjects.filter(p => p !== path)].slice(0, 10);
      
      await saveSettings({
        ...settings,
        activeProjectPath: path,
        recentProjects: updatedRecents
      });
      
      onProjectSelected(path);
    } catch (err) {
      alert(`Failed to open project: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center bg-zed-bg p-8 font-mono transition-colors duration-300 ${isDragging ? 'bg-accent/5' : ''}`}>
      {/* Overlay for Drag & Drop */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-accent/10 backdrop-blur-sm border-4 border-dashed border-accent/40 m-4 rounded-3xl pointer-events-none animate-in fade-in duration-200">
          <MousePointer2 size={48} className="text-accent mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-accent italic">Drop your repo here</h2>
          <p className="text-accent/60 text-sm mt-2">to instantly open it in snatch</p>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-12">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
            <PlusCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tighter italic">snatch</h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
            Lightweight Git snapshot manager for AI-assisted development sessions.
          </p>
        </div>

        {/* Manual Input & Browse */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Open Repository</h3>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input 
              type="text"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              placeholder="Paste absolute path to your local repository..."
              className="flex-1 bg-zed-panel border border-white/5 rounded-lg px-4 py-3 text-xs text-text-primary focus:border-accent/30 outline-none transition-all placeholder:text-text-muted/30"
            />
            <button 
              type="button"
              onClick={handleBrowse}
              className="px-4 py-3 bg-zed-active hover:bg-white/10 border border-white/5 rounded-lg text-text-primary transition-colors flex items-center gap-2 shrink-0"
              title="Browse File System"
            >
              <FolderOpen size={16} className="text-accent" />
              <span className="text-[10px] font-bold uppercase">Browse</span>
            </button>
            <button 
              type="submit"
              disabled={!manualPath.trim() || loading}
              className={`px-6 py-3 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                !manualPath.trim() || loading 
                  ? 'bg-white/5 text-text-muted opacity-50' 
                  : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
              }`}
            >
              {loading ? "OPENING..." : "OPEN"}
            </button>
          </form>
          <div className="text-center">
            <span className="text-[9px] text-text-muted/50 uppercase tracking-widest">— or drag and drop folder anywhere —</span>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Recent Sessions</h3>
          <div className="bg-zed-panel border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden shadow-2xl">
            {recentProjects.length === 0 ? (
              <div className="p-12 text-center text-[11px] text-text-muted italic flex flex-col items-center gap-2 opacity-50">
                <History size={16} />
                No recent projects found
              </div>
            ) : (
              recentProjects.map(path => (
                <button 
                  key={path}
                  onClick={() => selectProject(path)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-zed-active transition-all text-left group"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-text-primary font-bold truncate group-hover:text-accent transition-colors">
                      {path.replace(/\\/g, '/').split('/').pop()}
                    </div>
                    <div className="text-[9px] text-text-muted truncate opacity-50 mt-0.5">
                      {path}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-4">
          <p className="text-[9px] text-text-muted uppercase tracking-widest opacity-30">
            Secure Workspace Snapshot Engine • v2.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
