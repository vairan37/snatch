import React, { useState } from 'react';
import { X, GitCommit } from 'lucide-react';
import { Snapshot, snatchSquash } from '../lib/snatch';

interface SquashModalProps {
  snapshots: Snapshot[];
  onClose: () => void;
  onSquashed: () => void;
}

const SquashModal: React.FC<SquashModalProps> = ({ snapshots, onClose, onSquashed }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSquash = async () => {
    setLoading(true);
    try {
      await snatchSquash(message.trim() || undefined);
      onSquashed();
      onClose();
    } catch (err) {
      alert(`Squash failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zed-panel rounded-lg shadow-2xl border border-white/5 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="h-10 px-4 bg-zed-bg border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit size={14} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Squash Session</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase text-text-muted tracking-tight">Snapshots to merge ({snapshots.length})</h3>
            <div className="max-h-40 overflow-y-auto border border-white/5 rounded bg-zed-bg/50 p-2 space-y-1">
              {snapshots.map(snap => (
                <div key={snap.id} className="text-[11px] flex gap-2 items-start py-1">
                  <span className="text-accent font-bold opacity-50 shrink-0">{snap.id.substring(0, 8)}</span>
                  <span className="text-text-secondary line-clamp-1">{snap.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase text-text-muted tracking-tight">Final Commit Message</h3>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional: Enter a message for the final Git commit... (Default: Session summary)"
              className="w-full bg-zed-bg border border-white/5 rounded p-3 text-xs text-text-primary placeholder:text-text-muted/30 focus:border-accent/30 outline-none min-h-[100px] resize-none"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zed-bg border-t border-white/5 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSquash}
            disabled={loading}
            className="btn-accent flex items-center gap-2 py-2 px-6 shadow-lg shadow-accent/5"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <GitCommit size={14} />
            )}
            SQUASH & COMMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default SquashModal;
