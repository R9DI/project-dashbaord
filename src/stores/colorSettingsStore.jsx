import { create } from "zustand";

const defaultColorSettings = {
  inlinePassRate: { high: 90, low: 70 },
  elecPassRate: { high: 90, low: 70 },
  issueResponseIndex: { high: 90, low: 70 },
  wipAchievementRate: { high: 90, low: 70 },
  deadlineAchievementRate: { high: 90, low: 70 },
  finalScore: { high: 90, low: 70 },
};

export const useColorSettingsStore = create((set) => ({
  colorSettings: defaultColorSettings,

  setColorSettings: (settings) =>
    set({
      colorSettings: settings,
    }),

  updateColorSetting: (field, value) =>
    set((state) => ({
      colorSettings: {
        ...state.colorSettings,
        [field]: value,
      },
    })),
}));
