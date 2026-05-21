import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { ChatMessage, generateContextPrompt } from '../lib/ai';
import { getGitStatus, getGitLog } from '../lib/git';
import { snatchList, snatchSave } from '../lib/snatch';
import { loadSettings, Settings } from '../lib/settings';

const ChatModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [autoSaveNotify, setAutoSaveNotify] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoSaveNotify) {
      const timer = setTimeout(() => setAutoSaveNotify(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveNotify]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const [loadedSettings, status, log, snaps] = await Promise.all([
          loadSettings(),
          getGitStatus(),
          getGitLog(5),
          snatchList()
        ]);
        
        setSettings(loadedSettings);
        
        const systemPrompt = await generateContextPrompt(status, log, snaps as any);
        setMessages([
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: "Hello! I've loaded your repository context. How can I help you with your 'snatch' session today?" }
        ]);
      } catch (err) {
        setError("Failed to load repository context.");
        console.error(err);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const promptText = input.trim();
    const userMessage: ChatMessage = { role: 'user', content: promptText };
    
    setLoading(true);
    setError(null);

    try {
      // 1. Automatic safety snapshot before prompt
      const autoSaveMsg = `auto: avant prompt [${promptText.substring(0, 30)}${promptText.length > 30 ? '...' : ''}]`;
      await snatchSave(autoSaveMsg);
      setAutoSaveNotify(autoSaveMsg);

      // 2. Add message to UI
      setMessages(prev => [...prev, userMessage]);
      setMessage("");

      // 3. Mocking AI response for now (to be replaced by real API integration)
      setTimeout(() => {
        const aiResponse: ChatMessage = { 
          role: 'assistant', 
          content: `[Mock Response] I've received your prompt and captured a safety snapshot. Based on your repository context, I'm ready to assist. (Configure API keys in Settings for real interactions).` 
        };
        setMessages(prev => [...prev, aiResponse]);
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(`Failed to process: ${err}`);
      setLoading(false);
    }
  };

  const isProviderEnabled = settings && Object.values(settings.aiProviders).some(p => p.enabled && p.apiKey);

  return (
    <div className="flex-1 flex flex-col bg-zed-bg overflow-hidden h-full">
      {/* Header */}
      <header className="h-10 px-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">AI Contextual Assistant</span>
        </div>
        {!isProviderEnabled && (
          <div className="flex items-center gap-1.5 text-yellow-500/80">
            <AlertCircle size={12} />
            <span className="text-[9px] font-bold uppercase">No AI Provider Configured</span>
          </div>
        )}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        {autoSaveNotify && (
          <div className="sticky top-0 z-10 flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Safety Snapshot Captured</span>
            </div>
          </div>
        )}
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-accent/10 text-accent' : 'bg-zed-active text-text-primary'
            }`}>
              {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
              msg.role === 'assistant' ? 'bg-zed-panel text-text-primary border border-white/5' : 'bg-accent/5 text-text-primary border border-accent/10'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
              <Bot size={18} />
            </div>
            <div className="bg-zed-panel rounded-lg p-3 w-12 flex justify-center gap-1">
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-[11px] text-center">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-zed-sidebar border-t border-white/5">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isProviderEnabled || loading}
            placeholder={isProviderEnabled ? "Ask anything about your session..." : "Enable an AI provider in Settings to start chatting..."}
            className="w-full bg-zed-bg border border-white/5 rounded-md pl-4 pr-12 py-2.5 text-xs text-text-primary placeholder:text-text-muted/30 focus:border-accent/30 outline-none transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading || !isProviderEnabled}
            className={`absolute right-2 p-1.5 rounded transition-all ${
              !input.trim() || loading || !isProviderEnabled
                ? 'text-text-muted opacity-30' 
                : 'text-accent hover:bg-accent/10'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-center">
          <span className="text-[9px] text-text-muted uppercase tracking-tighter">Context Auto-Injected: Branch, Status, Snapshots, Log</span>
        </div>
      </form>
    </div>
  );
};

export default ChatModule;
