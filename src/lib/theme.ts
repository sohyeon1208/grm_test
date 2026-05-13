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
    bg:              "#1C1E2E",
    labelColor:      "rgba(255,255,255,0.9)",
    btnInactive:     "rgba(255,255,255,0.9)",
    btnBorder:       "rgba(255,255,255,0.2)",
    allActiveGrad:   "linear-gradient(90deg, #7B70EE, #00CFAA)",
    allActiveGlow:   "0 0 14px rgba(123,112,238,0.5)",
    optActiveGlow:   (color: string): string => `0 0 12px ${color}70`,
    optActiveText:   (isLight: boolean): string => isLight ? "#13141F" : "#fff",
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
    bg:              "#FFFFFF",
    labelColor:      "rgba(26,28,51,0.85)",
    btnInactive:     "rgba(26,28,51,0.55)",
    btnBorder:       "rgba(26,28,51,0.13)",
    allActiveGrad:   "#1E293B",
    allActiveGlow:   "0 2px 8px rgba(30,41,59,0.18)",
    optActiveGlow:   (color: string) => `0 1px 6px ${color}30`,
    optActiveText:   (_isLight: boolean) => "#fff",
  },
};

export type ThemeTokens = typeof DARK;
