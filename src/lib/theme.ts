export const DARK = {
  bg:      { page: "#13141F", card: "#1C1E2E" },
  text:    { primary: "rgba(255,255,255,0.87)", secondary: "rgba(255,255,255,0.6)", muted: "rgba(255,255,255,0.35)" },
  border:  "rgba(255,255,255,0.05)",
  divider: "rgba(255,255,255,0.06)",
  chart: {
    tooltip: { bg: "#1C1E2E", border: "rgba(255,255,255,0.1)" },
    axis:    "rgba(255,255,255,0.5)",
    grid:    "rgba(255,255,255,0.05)",
    cursor:  "rgba(255,255,255,0.03)",
    label:   "rgba(255,255,255,0.7)",
    item:    "rgba(255,255,255,0.87)",
  },
  filter: {
    bg:            "#1C1E2E",
    labelColor:    "rgba(255,255,255,0.9)",
    btnInactive:   "rgba(255,255,255,0.9)",
    btnBorder:     "rgba(255,255,255,0.2)",
    inactiveBtnBg: "transparent",
  },
};

export const LIGHT = {
  bg:      { page: "#F0F2F8", card: "#FFFFFF" },
  text:    { primary: "rgba(26,28,51,0.87)", secondary: "rgba(26,28,51,0.55)", muted: "rgba(26,28,51,0.35)" },
  border:  "rgba(26,28,51,0.08)",
  divider: "rgba(26,28,51,0.07)",
  chart: {
    tooltip: { bg: "#FFFFFF", border: "rgba(26,28,51,0.1)" },
    axis:    "rgba(26,28,51,0.45)",
    grid:    "rgba(26,28,51,0.08)",
    cursor:  "rgba(26,28,51,0.04)",
    label:   "rgba(26,28,51,0.65)",
    item:    "rgba(26,28,51,0.87)",
  },
  filter: {
    bg:            "#FFFFFF",
    labelColor:    "rgba(26,28,51,0.85)",
    btnInactive:   "rgba(26,28,51,0.75)",
    btnBorder:     "rgba(26,28,51,0.18)",
    inactiveBtnBg: "transparent",
  },
};

export type ThemeTokens = typeof DARK;
