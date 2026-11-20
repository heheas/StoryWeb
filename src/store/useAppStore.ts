import { create } from "zustand";

export type Theme = "light" | "dark";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "story-web-theme";

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export const useAppStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Theme still changes for this session if storage is unavailable.
      }
      return { theme };
    }),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme still changes for this session if storage is unavailable.
    }
    set({ theme });
  },
}));
