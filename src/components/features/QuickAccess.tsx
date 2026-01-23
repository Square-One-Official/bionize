import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Ruler,
  Contrast,
  Focus,
  type LucideIcon,
} from "lucide-react";

interface QuickAccessItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onToggle: () => void;
}

interface QuickAccessProps {
  items: QuickAccessItem[];
}

export function QuickAccess({ items }: QuickAccessProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2">
        {items.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                onClick={item.onToggle}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
                  item.isActive
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/50 bg-background text-muted-foreground hover:border-border hover:bg-accent/50"
                )}
                aria-label={`Toggle ${item.label}`}
                aria-pressed={item.isActive}
              >
                <item.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

// Pre-configured quick access items factory
export function createQuickAccessItems(
  settings: {
    bionicEnabled: boolean;
    readingRulerEnabled: boolean;
    highContrastMode: string;
    lineFocusEnabled: boolean;
  },
  handlers: {
    onToggleBionic: () => void;
    onToggleRuler: () => void;
    onToggleContrast: () => void;
    onToggleLineFocus: () => void;
  }
): QuickAccessItem[] {
  return [
    {
      id: "bionic",
      label: "Bionic Reading",
      icon: BookOpen,
      isActive: settings.bionicEnabled,
      onToggle: handlers.onToggleBionic,
    },
    {
      id: "ruler",
      label: "Reading Ruler",
      icon: Ruler,
      isActive: settings.readingRulerEnabled,
      onToggle: handlers.onToggleRuler,
    },
    {
      id: "contrast",
      label: "High Contrast",
      icon: Contrast,
      isActive: settings.highContrastMode !== "off",
      onToggle: handlers.onToggleContrast,
    },
    {
      id: "focus",
      label: "Line Focus",
      icon: Focus,
      isActive: settings.lineFocusEnabled,
      onToggle: handlers.onToggleLineFocus,
    },
  ];
}
