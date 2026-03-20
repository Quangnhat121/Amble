import { create } from "zustand";

type Language = "vi" | "en";

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "vi",
  setLanguage: (language) => set({ language }),
}));
