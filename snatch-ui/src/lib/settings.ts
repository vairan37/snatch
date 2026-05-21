import { load } from "@tauri-apps/plugin-store";

export interface AIProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl?: string;
}

export interface Settings {
  activeProjectPath: string | null;
  recentProjects: string[];
  aiProviders: {
    claude: AIProviderConfig;
    gpt: AIProviderConfig;
    gemini: AIProviderConfig;
    ollama: AIProviderConfig;
  };
}

const DEFAULT_SETTINGS: Settings = {
  activeProjectPath: null,
  recentProjects: [],
  aiProviders: {
    claude: { enabled: false, apiKey: "" },
    gpt: { enabled: false, apiKey: "" },
    gemini: { enabled: false, apiKey: "" },
    ollama: { enabled: false, apiKey: "", baseUrl: "http://localhost:11434" },
  },
};

const STORE_PATH = "settings.json";

export async function loadSettings(): Promise<Settings> {
  const store = await load(STORE_PATH);
  const val = await store.get<Settings>("settings");
  return val || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await load(STORE_PATH);
  await store.set("settings", settings);
  await store.save();
}
