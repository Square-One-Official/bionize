import React from "react";
import {
  ToggleSetting,
  SliderSetting,
  SelectSetting,
  ColorSetting,
} from "./SettingRow";
import type {
  VisionSettings,
  HighContrastTheme,
  ColorBlindnessFilter,
  LinkHighlightStyle,
} from "@/shared/types";

interface VisionSectionProps {
  settings: VisionSettings;
  onSettingsChange: (settings: Partial<VisionSettings>) => void;
}

const HIGH_CONTRAST_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "yellow-black", label: "Yellow on Black" },
  { value: "black-yellow", label: "Black on Yellow" },
  { value: "white-blue", label: "White on Blue" },
];

const COLOR_BLINDNESS_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "deuteranopia", label: "Deuteranopia (Red-Green)" },
  { value: "protanopia", label: "Protanopia (Red-Green)" },
  { value: "tritanopia", label: "Tritanopia (Blue-Yellow)" },
  { value: "achromatopsia", label: "Achromatopsia (Full)" },
];

const LINK_HIGHLIGHT_OPTIONS = [
  { value: "underline", label: "Underline" },
  { value: "background", label: "Background" },
  { value: "outline", label: "Outline" },
];

export function VisionSection({
  settings,
  onSettingsChange,
}: VisionSectionProps) {
  return (
    <div className="space-y-4">
      {/* High Contrast */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <SelectSetting
          label="High Contrast"
          description="Change page colors for better visibility"
          value={settings.highContrastMode}
          options={HIGH_CONTRAST_OPTIONS}
          onValueChange={(v) =>
            onSettingsChange({ highContrastMode: v as HighContrastTheme })
          }
        />
      </div>

      {/* Color Blindness Filter */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <SelectSetting
          label="Color Blindness Filter"
          description="Adjust colors for color vision deficiency"
          value={settings.colorBlindnessFilter}
          options={COLOR_BLINDNESS_OPTIONS}
          onValueChange={(v) =>
            onSettingsChange({ colorBlindnessFilter: v as ColorBlindnessFilter })
          }
        />

        {settings.colorBlindnessFilter !== "off" && (
          <div className="pl-1">
            <SliderSetting
              label="Intensity"
              value={Math.round(settings.colorBlindnessIntensity * 100)}
              min={50}
              max={100}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ colorBlindnessIntensity: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Color Adjustments */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Invert Colors"
          description="Invert all page colors"
          checked={settings.invertColors}
          onCheckedChange={(checked) =>
            onSettingsChange({ invertColors: checked })
          }
        />
      </div>

      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Grayscale"
          description="Remove all color from the page"
          checked={settings.grayscaleEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ grayscaleEnabled: checked })
          }
        />

        {settings.grayscaleEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Intensity"
              value={Math.round(settings.grayscaleIntensity * 100)}
              min={50}
              max={100}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ grayscaleIntensity: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Link Highlighting */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Highlight Links"
          description="Make links more visible"
          checked={settings.linkHighlightEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ linkHighlightEnabled: checked })
          }
        />

        {settings.linkHighlightEnabled && (
          <div className="space-y-3 pl-1">
            <SelectSetting
              label="Style"
              value={settings.linkHighlightStyle}
              options={LINK_HIGHLIGHT_OPTIONS}
              onValueChange={(v) =>
                onSettingsChange({ linkHighlightStyle: v as LinkHighlightStyle })
              }
            />
            <ColorSetting
              label="Color"
              value={settings.linkHighlightColor}
              onValueChange={(v) =>
                onSettingsChange({ linkHighlightColor: v })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
