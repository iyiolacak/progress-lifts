import { create, StateCreator } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

// --- Slice Interfaces ---

interface OnboardingSlice {
  onboardingStatus: "skipped" | "done" | "prompt";
  setOnboardingStatus: (status: "skipped" | "done" | "prompt") => void;
}

interface ApiKeySlice {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  clearApiKey: () => void;
  hasApiKey: () => boolean;
}

interface LocaleSlice {
  locale: string;
  setLocale: (locale: string) => void;
}

interface SettingsSlice {
  modelProvider: "openai" | "google-gemini-2.5-flash";
  setModelProvider: (provider: "openai" | "google-gemini-2.5-flash") => void;
  saveVoice: boolean;
  setSaveVoice: (save: boolean) => void;
  shareDiagnostics: boolean;
  setShareDiagnostics: (share: boolean) => void;

  entryFormPosition: "top" | "bottom";
  setEntryFormPosition: (position: "top" | "bottom") => void;

  // FOCUS SHORTCUTS SETTINGS
  enableEntryFocusShortcuts: boolean;
  setEnableEntryFocusShortcuts: (enabled: boolean) => void;
  focusShortcutSlash: boolean;
  setFocusShortcutSlash: (enabled: boolean) => void;
  focusShortcutEnter: boolean;
  setFocusShortcutEnter: (enabled: boolean) => void;
  focusShortcutTypeToFocus: boolean;
  setFocusShortcutTypeToFocus: (enabled: boolean) => void;
  focusShortcutCmdJ: boolean;
  setFocusShortcutCmdJ: (enabled: boolean) => void;
  focusAutoOnLoad: boolean;
  setFocusAutoOnLoad: (enabled: boolean) => void;
}
// --- Combined AppSettingsStore Type ---

type AppSettingsStore = OnboardingSlice &
  ApiKeySlice &
  LocaleSlice &
  SettingsSlice;

// --- Individual Slice Creators ---

const createOnboardingSlice: StateCreator<
  AppSettingsStore,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  onboardingStatus: "prompt",
  setOnboardingStatus: (status) => set({ onboardingStatus: status }),
});

const createApiKeySlice: StateCreator<AppSettingsStore, [], [], ApiKeySlice> = (
  set,
  get
) => ({
  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),
  clearApiKey: () => set({ apiKey: null }),
  hasApiKey: () => get().apiKey !== null,
});

const createLocaleSlice: StateCreator<AppSettingsStore, [], [], LocaleSlice> = (
  set
) => ({
  locale: "en",
  setLocale: (locale: string) => set({ locale }),
});

const createSettingsSlice: StateCreator<
  AppSettingsStore,
  [],
  [],
  SettingsSlice
> = (set) => ({
  // MODEL preferences
  modelProvider: "openai",
  setModelProvider: (provider) => set({ modelProvider: provider }),
  
  // ===

  // Privacy preferences

    // VOICE preferences
  saveVoice: true,
  setSaveVoice: (save) => set({ saveVoice: save }),

    // DIAGNOSTICS preferences
  shareDiagnostics: false,
  setShareDiagnostics: (share) => set({ shareDiagnostics: share }),

  // ===

  // LAYOUT preferences
  entryFormPosition: "bottom",
  setEntryFormPosition: (position) => set({ entryFormPosition: position }),

  // FOCUS SHORTCUTS preferences
  enableEntryFocusShortcuts: true,
  setEnableEntryFocusShortcuts: (enabled) =>
    set({ enableEntryFocusShortcuts: enabled }),
  focusShortcutSlash: true,
  setFocusShortcutSlash: (enabled) => set({ focusShortcutSlash: enabled }),
  focusShortcutEnter: true,
  setFocusShortcutEnter: (enabled) => set({ focusShortcutEnter: enabled }),
  focusShortcutTypeToFocus: true,
  setFocusShortcutTypeToFocus: (enabled) =>
    set({ focusShortcutTypeToFocus: enabled }),
  focusShortcutCmdJ: true,
  setFocusShortcutCmdJ: (enabled) => set({ focusShortcutCmdJ: enabled }),
  focusAutoOnLoad: true,
  setFocusAutoOnLoad: (enabled) => set({ focusAutoOnLoad: enabled }),
});

// --- Main AppSettings Store ---

export const useAppSettings = create<AppSettingsStore>()(
  subscribeWithSelector(
    persist(
      (...a) => ({
        ...createOnboardingSlice(...a),
        ...createApiKeySlice(...a),
        ...createLocaleSlice(...a),
        ...createSettingsSlice(...a),
      }),
      {
        name: "ll:app-settings", // key in localStorage
      }
    )
  )
);
