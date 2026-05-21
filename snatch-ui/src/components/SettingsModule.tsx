import React, { useState, useEffect } from 'react';
import { Save, Cpu, Brain, Bot, Laptop } from 'lucide-react';
import { Settings, loadSettings, saveSettings, AIProviderConfig } from '../lib/settings';

const SettingsModule: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateProvider = (provider: keyof Settings['aiProviders'], updates: Partial<AIProviderConfig>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      aiProviders: {
        ...settings.aiProviders,
        [provider]: { ...settings.aiProviders[provider], ...updates },
      },
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSettings(settings);
    } catch (err) {
      alert(`Failed to save settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-8 text-text-muted animate-pulse">Loading settings...</div>;

  const ProviderCard = ({ 
    id, 
    name, 
    icon: Icon, 
    config, 
    showUrl = false 
  }: { 
    id: keyof Settings['aiProviders'], 
    name: string, 
    icon: any, 
    config: AIProviderConfig,
    showUrl?: boolean
  }) => (
    <div className="bg-zed-panel rounded-lg border border-white/5 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zed-bg rounded-md text-accent">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary">{name}</h3>
            <p className="text-[10px] text-text-muted">AI Model Provider</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div 
            onClick={() => updateProvider(id, { enabled: !config.enabled })}
            className={`w-8 h-4.5 rounded-full relative transition-colors ${config.enabled ? 'bg-accent/40' : 'bg-zed-bg'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-text-primary transition-transform ${config.enabled ? 'translate-x-3.5 bg-accent' : ''}`}></div>
          </div>
        </label>
      </div>
      
      <div className={`p-4 space-y-4 transition-opacity duration-200 ${config.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-text-muted tracking-tight">API Key</label>
          <input 
            type="password"
            value={config.apiKey}
            onChange={(e) => updateProvider(id, { apiKey: e.target.value })}
            placeholder={`Enter your ${name} API key...`}
            className="w-full bg-zed-bg border border-white/5 rounded px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/30 focus:border-accent/30 outline-none transition-colors"
          />
        </div>
        {showUrl && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-tight">Base URL</label>
            <input 
              type="text"
              value={config.baseUrl}
              onChange={(e) => updateProvider(id, { baseUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-zed-bg border border-white/5 rounded px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/30 focus:border-accent/30 outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-zed-bg overflow-hidden">
      <header className="h-10 px-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">AI Provider Settings</span>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-accent flex items-center gap-2 text-[10px] py-1 px-4"
        >
          {saving ? <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <Save size={14} />}
          SAVE CHANGES
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProviderCard id="claude" name="Anthropic Claude" icon={Brain} config={settings.aiProviders.claude} />
            <ProviderCard id="gpt" name="OpenAI GPT" icon={Cpu} config={settings.aiProviders.gpt} />
            <ProviderCard id="gemini" name="Google Gemini" icon={Bot} config={settings.aiProviders.gemini} />
            <ProviderCard id="ollama" name="Ollama (Local)" icon={Laptop} config={settings.aiProviders.ollama} showUrl />
          </div>

          <div className="mt-8 p-4 rounded-lg bg-accent/5 border border-accent/10">
            <h4 className="text-[11px] font-bold text-accent uppercase mb-1">Security Note</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Your API keys are stored locally on your machine via Tauri's secure store. They are never sent to our servers. Ensure you keep your machine secure and do not share your settings file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
