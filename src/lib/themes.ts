export interface Theme {
  name: string;
  label: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const themes: Theme[] = [
  {
    name: "light",
    label: "Light",
    colors: {
      background: "0 0% 100%",
      foreground: "0 0% 3.9%",
      card: "0 0% 100%",
      cardForeground: "0 0% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 3.9%",
      primary: "0 0% 9%",
      primaryForeground: "0 0% 98%",
      secondary: "0 0% 96.1%",
      secondaryForeground: "0 0% 9%",
      muted: "0 0% 96.1%",
      mutedForeground: "0 0% 45.1%",
      accent: "0 0% 96.1%",
      accentForeground: "0 0% 9%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%",
      input: "0 0% 89.8%",
      ring: "0 0% 3.9%",
    },
  },
  {
    name: "dark",
    label: "Dark",
    colors: {
      background: "0 0% 0%",
      foreground: "0 0% 100%",
      card: "0 0% 5%",
      cardForeground: "0 0% 100%",
      popover: "0 0% 5%",
      popoverForeground: "0 0% 100%",
      primary: "0 0% 100%",
      primaryForeground: "0 0% 0%",
      secondary: "0 0% 10%",
      secondaryForeground: "0 0% 100%",
      muted: "0 0% 12%",
      mutedForeground: "0 0% 70%",
      accent: "0 0% 15%",
      accentForeground: "0 0% 100%",
      destructive: "0 62.8% 50%",
      destructiveForeground: "0 0% 100%",
      border: "0 0% 20%",
      input: "0 0% 15%",
      ring: "0 0% 90%",
    },
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: {
      background: "210 100% 97%",
      foreground: "210 40% 15%",
      card: "210 100% 98%",
      cardForeground: "210 40% 15%",
      popover: "210 100% 98%",
      popoverForeground: "210 40% 15%",
      primary: "210 100% 45%",
      primaryForeground: "0 0% 100%",
      secondary: "210 30% 90%",
      secondaryForeground: "210 40% 15%",
      muted: "210 30% 92%",
      mutedForeground: "210 20% 40%",
      accent: "195 100% 45%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "210 30% 85%",
      input: "210 30% 85%",
      ring: "210 100% 45%",
    },
  },
  {
    name: "solarized",
    label: "Solarized",
    colors: {
      background: "44 87% 94%",
      foreground: "192 100% 11%",
      card: "44 87% 96%",
      cardForeground: "192 100% 11%",
      popover: "44 87% 96%",
      popoverForeground: "192 100% 11%",
      primary: "205 69% 49%",
      primaryForeground: "44 87% 94%",
      secondary: "45 100% 85%",
      secondaryForeground: "192 100% 11%",
      muted: "44 10% 90%",
      mutedForeground: "192 15% 40%",
      accent: "175 59% 40%",
      accentForeground: "44 87% 94%",
      destructive: "1 71% 52%",
      destructiveForeground: "44 87% 94%",
      border: "45 11% 84%",
      input: "45 11% 84%",
      ring: "205 69% 49%",
    },
  },
  {
    name: "night-owl",
    label: "Night Owl",
    colors: {
      background: "0 0% 0%",
      foreground: "0 0% 100%",
      card: "230 20% 5%",
      cardForeground: "0 0% 100%",
      popover: "230 20% 5%",
      popoverForeground: "0 0% 100%",
      primary: "207 82% 66%",
      primaryForeground: "0 0% 0%",
      secondary: "230 15% 10%",
      secondaryForeground: "0 0% 100%",
      muted: "230 15% 12%",
      mutedForeground: "0 0% 75%",
      accent: "286 60% 67%",
      accentForeground: "0 0% 0%",
      destructive: "0 63% 58%",
      destructiveForeground: "0 0% 100%",
      border: "230 15% 15%",
      input: "230 15% 12%",
      ring: "207 82% 66%",
    },
  },
  {
    name: "minimal",
    label: "Minimal",
    colors: {
      background: "0 0% 98%",
      foreground: "0 0% 10%",
      card: "0 0% 100%",
      cardForeground: "0 0% 10%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 10%",
      primary: "0 0% 20%",
      primaryForeground: "0 0% 100%",
      secondary: "0 0% 94%",
      secondaryForeground: "0 0% 20%",
      muted: "0 0% 95%",
      mutedForeground: "0 0% 45%",
      accent: "0 0% 90%",
      accentForeground: "0 0% 20%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 90%",
      input: "0 0% 90%",
      ring: "0 0% 20%",
    },
  },
];

export function applyTheme(themeName: string) {
  const theme = themes.find((t) => t.name === themeName);
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Update sidebar colors to match theme
  const isDark = themeName === "dark" || themeName === "night-owl";
  if (isDark) {
    // Dark themes: white text on dark background
    root.style.setProperty("--sidebar-background", theme.colors.background);
    root.style.setProperty("--sidebar-foreground", "0 0% 100%"); // Pure white
    root.style.setProperty("--sidebar-accent", theme.colors.muted);
    root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%"); // Pure white
    root.style.setProperty("--sidebar-border", theme.colors.border);
  } else {
    // Light themes: dark text on light background
    root.style.setProperty("--sidebar-background", theme.colors.background);
    root.style.setProperty("--sidebar-foreground", theme.colors.foreground);
    root.style.setProperty("--sidebar-accent", theme.colors.muted);
    root.style.setProperty("--sidebar-accent-foreground", theme.colors.foreground);
    root.style.setProperty("--sidebar-border", theme.colors.border);
  }

  // Store theme preference
  localStorage.setItem("app-theme", themeName);
}

export function getStoredTheme(): string {
  return localStorage.getItem("app-theme") || "light";
}

