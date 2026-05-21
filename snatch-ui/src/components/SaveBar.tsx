import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface SaveBarProps {
  onSave: (message: string) => Promise<void>;
  loading: boolean;
}

const SaveBar: React.FC<SaveBarProps> = ({ onSave, loading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    await onSave(message);
    setMessage("");
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="h-12 bg-zed-sidebar border-t border-white/5 flex items-center px-4 gap-4"
    >
      <div className="flex-1 flex items-center gap-3">
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Snapshot</span>
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What changed? Enter a message to save current state..."
          className="flex-1 bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted/50"
          autoFocus
        />
      </div>
      <button 
        disabled={!message.trim() || loading}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
          !message.trim() || loading 
            ? 'text-text-muted bg-white/5 opacity-50' 
            : 'text-accent bg-accent/10 hover:bg-accent/20'
        }`}
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Send size={14} />
        )}
        SAVE
      </button>
    </form>
  );
};

export default SaveBar;
