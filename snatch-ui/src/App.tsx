import { useState, useEffect } from "react";
import { GitBranch, History, MessageSquare, Terminal as TerminalIcon, ChevronRight, ChevronLeft, LayoutPanelLeft, Settings as SettingsIcon } from "lucide-react";
import { snatchList } from "./lib/snatch";
import { getGitStatus, GitStatus } from "./lib/git";
import GitGraph from "./components/GitGraph";
import SnapshotsModule from "./components/SnapshotsModule";
import SettingsModule from "./components/SettingsModule";
import ChatModule from "./components/ChatModule";
import TerminalComponent from "./components/Terminal";
import "./App.css";

type Module = "graph" | "snapshots" | "chat" | "settings";

function App() {
  const [activeModule, setActiveModule] = useState<Module>("snapshots");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  
  const [snapshots, setSnapshots] = useState([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSnapshotsInGraph, setShowSnapshotsInGraph] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [snapList, status] = await Promise.all([
        snatchList(),
        getGitStatus()
      ]);
      setSnapshots(snapList as any);
      setGitStatus(status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="flex h-screen bg-zed-bg text-text-primary font-mono overflow-hidden">
      {/* 1. Left Sidebar (Navigation) */}
      <aside className="w-12 bg-zed-sidebar flex flex-col items-center py-4 gap-4 border-r border-white/5 z-20">
        <div className="w-8 h-8 bg-accent/20 rounded-md flex items-center justify-center text-accent font-bold text-xs mb-4 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
          SN
        </div>
        
        <button 
          onClick={() => setActiveModule("graph")}
          className={`sidebar-item ${activeModule === "graph" ? "active" : ""}`}
          title="Git Graph"
        >
          <GitBranch size={20} />
        </button>
        
        <button 
          onClick={() => setActiveModule("snapshots")}
          className={`sidebar-item ${activeModule === "snapshots" ? "active" : ""}`}
          title="Snapshots"
        >
          <History size={20} />
        </button>
        
        <button 
          onClick={() => setActiveModule("chat")}
          className={`sidebar-item ${activeModule === "chat" ? "active" : ""}`}
          title="AI Chat"
        >
          <MessageSquare size={20} />
        </button>

        <button 
          onClick={() => setActiveModule("settings")}
          className={`sidebar-item ${activeModule === "settings" ? "active" : ""}`}
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>

        <div className="mt-auto mb-2">
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`sidebar-item ${isTerminalOpen ? "text-accent" : ""}`}
          >
            <TerminalIcon size={20} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Toolbar */}
        <header className="h-9 bg-zed-bg flex items-center justify-between px-4 border-b border-white/5 z-10">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-text-secondary">branch:</span>
            <span className="text-accent font-bold px-1.5 py-0.5 bg-accent/5 rounded border border-accent/10">
              {gitStatus?.branch || "main"}
            </span>
            {loading && <span className="animate-pulse text-text-muted">refreshing...</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`p-1 rounded hover:bg-zed-active transition-colors ${isRightPanelOpen ? "text-accent" : "text-text-secondary"}`}
            >
              <LayoutPanelLeft size={16} className="rotate-180" />
            </button>
          </div>
        </header>

        {/* Middle Section (Primary + Right Panel) */}
        <div className="flex-1 flex min-h-0">
          {/* Primary View */}
          <section className="flex-1 flex flex-col min-w-0 bg-zed-bg">
            <div className="flex-1 overflow-y-auto">
              {activeModule === "snapshots" && (
                <SnapshotsModule />
              )}
              {activeModule === "graph" && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 px-4 pt-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Git History</h2>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          onClick={() => setShowSnapshotsInGraph(!showSnapshotsInGraph)}
                          className={`w-7 h-4 rounded-full relative transition-colors ${showSnapshotsInGraph ? 'bg-accent/40' : 'bg-zed-panel'}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-text-primary transition-transform ${showSnapshotsInGraph ? 'translate-x-3 bg-accent' : ''}`}></div>
                        </div>
                        <span className="text-[10px] text-text-secondary group-hover:text-text-primary transition-colors uppercase font-bold tracking-tight">Show Snapshots</span>
                      </label>
                    </div>
                    <button onClick={refreshData} className="btn-accent text-[10px]">Refresh</button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <GitGraph snapshots={snapshots} showSnapshots={showSnapshotsInGraph} />
                  </div>
                </div>
              )}
              {activeModule === "chat" && (
                <ChatModule />
              )}
              {activeModule === "settings" && (
                <SettingsModule />
              )}
            </div>
          </section>

          {/* Collapsible Right Panel */}
          {isRightPanelOpen && (
            <aside className="w-72 bg-zed-panel border-l border-white/5 flex flex-col z-10 animate-in slide-in-from-right duration-200">
              <div className="h-9 flex items-center px-3 border-b border-white/5 justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Inspector</span>
                <button onClick={() => setIsRightPanelOpen(false)} className="text-text-muted hover:text-text-primary">
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-text-muted uppercase font-bold">Workspace Status</div>
                  <pre className="p-2 bg-zed-bg rounded border border-white/5 text-[11px] leading-tight">
                    {gitStatus?.raw || "Scanning..."}
                  </pre>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* 3. Bottom Terminal Panel */}
        {isTerminalOpen && (
          <section className="h-64 bg-zed-sidebar border-t border-white/5 flex flex-col z-20 animate-in slide-in-from-bottom duration-200">
            <div className="h-8 flex items-center px-3 border-b border-white/5 justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Terminal</span>
                <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">bash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted mr-2">Ctrl+\ to toggle</span>
                <button onClick={() => setIsTerminalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <ChevronLeft size={14} className="rotate-270" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 bg-black/20">
              <TerminalComponent />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
