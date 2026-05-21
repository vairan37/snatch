import { useState, useEffect } from "react";
import { GitBranch, History, MessageSquare, Terminal as TerminalIcon, ChevronRight, ChevronLeft, LayoutPanelRight } from "lucide-react";
import { Snapshot, snatchList } from "./lib/snatch";
import { getGitStatus, GitStatus } from "./lib/git";
import "./App.css";

type Module = "graph" | "snapshots" | "chat";

function App() {
  const [activeModule, setActiveModule] = useState<Module>("snapshots");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [snapList, status] = await Promise.all([
        snatchList(),
        getGitStatus()
      ]);
      setSnapshots(snapList);
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
              <LayoutPanelRight size={16} />
            </button>
          </div>
        </header>

        {/* Middle Section (Primary + Right Panel) */}
        <div className="flex-1 flex min-h-0">
          {/* Primary View */}
          <section className="flex-1 flex flex-col min-w-0 bg-zed-bg">
            <div className="flex-1 overflow-y-auto p-4">
              {activeModule === "snapshots" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Session History</h2>
                    <button onClick={refreshData} className="btn-accent text-[10px]">Refresh</button>
                  </div>
                  {snapshots.map(snap => (
                    <div key={snap.id} className="group p-3 rounded bg-zed-panel border border-white/5 hover:border-accent/20 transition-all cursor-pointer">
                      <div className="flex justify-between items-center mb-1">
                        <code className="text-[10px] text-accent font-bold opacity-70 group-hover:opacity-100">{snap.id.substring(0, 7)}</code>
                        <span className="text-[10px] text-text-muted">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs leading-snug">{snap.message}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeModule === "graph" && (
                <div className="flex items-center justify-center h-full text-text-muted italic">Git Graph View (Coming Soon)</div>
              )}
              {activeModule === "chat" && (
                <div className="flex items-center justify-center h-full text-text-muted italic">AI Contextual Chat (Coming Soon)</div>
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
          <section className="h-48 bg-zed-sidebar border-t border-white/5 flex flex-col z-20 animate-in slide-in-from-bottom duration-200">
            <div className="h-8 flex items-center px-3 border-b border-white/5 justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Terminal</span>
                <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">snatch-cli</span>
              </div>
              <button onClick={() => setIsTerminalOpen(false)} className="text-text-muted hover:text-text-primary">
                <ChevronLeft size={14} className="rotate-270" />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] bg-black/20">
              <div className="text-accent mb-1">$ snatch list</div>
              <pre className="text-text-secondary opacity-80 leading-relaxed">
                {snapshots.length > 0 ? "Loading CLI output simulation..." : "Initializing session..."}
              </pre>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
