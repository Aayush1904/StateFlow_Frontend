import * as React from "react";
import { Check, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { themes, applyTheme, getStoredTheme } from "@/lib/themes";

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = React.useState(getStoredTheme());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    setCurrentTheme(stored);
    applyTheme(stored);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:bg-accent hover:text-accent-foreground">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
  };

  const getCurrentThemeLabel = () => {
    return themes.find((t) => t.name === currentTheme)?.label || "Theme";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-2 sm:px-3 text-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Select theme"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="hidden sm:inline text-sm">{getCurrentThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="p-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Choose Theme
          </p>
          <div className="space-y-1">
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.name}
                onClick={() => handleThemeChange(theme.name)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{
                      background: `hsl(${theme.colors.primary})`,
                    }}
                  />
                  <span>{theme.label}</span>
                </div>
                <AnimatePresence>
                  {currentTheme === theme.name && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

