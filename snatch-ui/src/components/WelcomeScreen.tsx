import React, { useState, useEffect } from 'react';
import { FolderOpen, History, PlusCircle, ArrowRight } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { loadSettings, saveSettings } from '../lib/settings';

interface WelcomeScreenProps {
  onProjectSelected: (path: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onProjectSelected }) => {
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings().then(s => setRecentProjects(s.recentProjects));
  }, []);

  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository"
      });

      if (selected && typeof selected === 'string') {
        await selectProject(selected);
      }
    } catch (err) {
      console.error(err);
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
    <div className="flex-1 flex flex-col items-center justify-center bg-zed-bg p-8 font-mono">
      <div className="w-full max-w-2xl space-y-12">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
            <PlusCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tighter italic">snatch</h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
            Lightweight Git snapshot manager for AI-assisted development sessions. 
            Ready to secure your workspace?
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Action */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Start Session</h3>
            <button 
              onClick={handleOpenFolder}
              disabled={loading}
              className="w-full group bg-zed-panel hover:bg-zed-active border border-white/5 p-6 rounded-xl flex flex-col items-center gap-4 transition-all"
            >
              <div className="p-3 bg-accent/10 rounded-lg text-accent group-hover:scale-110 transition-transform">
                <FolderOpen size={24} />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-text-primary">Open Git Repository</div>
                <div className="text-[10px] text-text-muted mt-1 uppercase tracking-tight">Select a local folder</div>
              </div>
            </button>
          </div>

          {/* Recent Projects */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Recents</h3>
            <div className="bg-zed-panel border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
              {recentProjects.length === 0 ? (
                <div className="p-12 text-center text-[11px] text-text-muted italic flex flex-col items-center gap-2">
                  <History size={16} />
                  No recent projects
                </div>
              ) : (
                recentProjects.map(path => (
                  <button 
                    key={path}
                    onClick={() => selectProject(path)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-zed-active transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-text-primary font-bold truncate">
                        {path.split('/').pop()}
                      </div>
                      <div className="text-[9px] text-text-muted truncate opacity-60">
                        {path}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-[9px] text-text-muted uppercase tracking-widest">
            v2.0 • SNATCH CLI SIDECAR INTEGRATED
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
