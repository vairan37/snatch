import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, FileText, Search, GitCommit } from 'lucide-react';
import { Snapshot, snatchList, snatchDiff, snatchRestore, snatchDrop, snatchSave } from '../lib/snatch';
import DiffViewer from './DiffViewer';
import SaveBar from './SaveBar';
import SquashModal from './SquashModal';

const SnapshotsModule: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [loadingList, setLoading] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [search, setSearch] = useState("");
  const [isSquashModalOpen, setIsSquashModalOpen] = useState(false);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const list = await snatchList();
      setSnapshots(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setLoadingDiff(true);
    try {
      const d = await snatchDiff(id);
      setDiff(d);
    } catch (err) {
      console.error(err);
      setDiff("Failed to load diff");
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Are you sure you want to restore this snapshot? This will overwrite your current workspace changes.")) return;
    setLoadingAction(true);
    try {
      await snatchRestore(id);
      await loadSnapshots();
      setDiff(null);
      setSelectedId(null);
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDrop = async (id: string) => {
    if (!confirm("Delete this snapshot permanently?")) return;
    setLoadingAction(true);
    try {
      await snatchDrop(id);
      await loadSnapshots();
      if (selectedId === id) {
        setDiff(null);
        setSelectedId(null);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSave = async (message: string) => {
    setLoadingAction(true);
    try {
      await snatchSave(message);
      await loadSnapshots();
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredSnapshots = snapshots.filter(s => 
    s.message.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zed-bg">
      <div className="flex-1 flex min-h-0">
        {/* Left Side: List */}
        <div className="w-80 flex flex-col border-r border-white/5">
          <div className="p-3 border-b border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Snapshots</span>
              <span className="text-[10px] text-text-muted">{snapshots.length} total</span>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter snapshots..."
                className="w-full bg-zed-sidebar border border-white/5 rounded px-8 py-1 text-[11px] text-text-primary focus:border-accent/30 outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : filteredSnapshots.length === 0 ? (
              <div className="p-8 text-center text-text-muted italic text-[11px]">
                No snapshots found matching your criteria
              </div>
            ) : (
              filteredSnapshots.map(snap => (
                <div 
                  key={snap.id} 
                  onClick={() => handleSelect(snap.id)}
                  className={`p-3 border-b border-white/5 cursor-pointer group transition-all relative ${
                    selectedId === snap.id ? 'bg-zed-active' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold ${selectedId === snap.id ? 'text-accent' : 'text-text-muted'}`}>
                      {snap.id.substring(0, 8)}
                    </span>
                    <span className="text-[9px] text-text-muted group-hover:text-text-secondary">
                      {new Date(snap.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-text-primary pr-12 line-clamp-2 leading-snug">
                    {snap.message}
                  </div>
                  
                  {/* Actions (visible on hover or when selected) */}
                  <div className="absolute right-2 bottom-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRestore(snap.id); }}
                      className="p-1 hover:text-accent text-text-muted transition-colors"
                      title="Restore"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDrop(snap.id); }}
                      className="p-1 hover:text-red-400 text-text-muted transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Diff Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-zed-panel">
          <div className="h-10 flex items-center px-4 border-b border-white/5 justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                {selectedId ? `Diff: ${selectedId.substring(0, 8)}` : 'Diff Viewer'}
              </span>
            </div>
            {snapshots.length > 0 && (
              <button 
                onClick={() => setIsSquashModalOpen(true)}
                className="btn-accent flex items-center gap-2 text-[9px] py-1 px-3 shadow-[0_0_10px_rgba(0,255,136,0.05)]"
              >
                <GitCommit size={12} />
                SQUASH SESSION
              </button>
            )}
          </div>
          <DiffViewer diff={diff} loading={loadingDiff} />
        </div>
      </div>

      {/* Bottom: Save Bar */}
      <SaveBar onSave={handleSave} loading={loadingAction} />

      {/* Modals */}
      {isSquashModalOpen && (
        <SquashModal 
          snapshots={snapshots} 
          onClose={() => setIsSquashModalOpen(false)} 
          onSquashed={() => {
            loadSnapshots();
            setDiff(null);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};

export default SnapshotsModule;
