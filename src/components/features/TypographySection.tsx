import React from "react";
import {
  ToggleSetting,
  SliderSetting,
  SelectSetting,
} from "./SettingRow";
import type { TypographySettings, FontFamily, TextAlignment } from "@/shared/types";

interface TypographySectionProps {
  settings: TypographySettings;
  onSettingsChange: (settings: Partial<TypographySettings>) => void;
}

const FONT_OPTIONS = [
  { value: "system", label: "System Default" },
  { value: "opendyslexic", label: "OpenDyslexic" },
  { value: "atkinson", label: "Atkinson Hyperlegible" },
  { value: "lexie", label: "Lexie Readable" },
  { value: "comic-sans", label: "Comic Sans" },
  { value: "custom", label: "Custom..." },
];

const TEXT_ALIGN_OPTIONS = [
  { value: "inherit", label: "Default" },
  { value: "left", label: "Left" },
  { value: "justify", label: "Justify" },
];

export function TypographySection({
  settings,
  onSettingsChange,
}: TypographySectionProps) {
  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <SelectSetting
          label="Font Family"
          description="Change the page font"
          value={settings.fontFamily}
          options={FONT_OPTIONS}
          onValueChange={(v) =>
            onSettingsChange({ fontFamily: v as FontFamily })
          }
        />

        {settings.fontFamily === "custom" && (
          <div className="pl-1">
            <input
              type="text"
              value={settings.customFontFamily}
              onChange={(e) =>
                onSettingsChange({ customFontFamily: e.target.value })
              }
              placeholder="Enter font name..."
              className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Adjust Font Size"
          checked={settings.fontSizeEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ fontSizeEnabled: checked })
          }
        />

        {settings.fontSizeEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Scale"
              value={Math.round(settings.fontSizeScale * 100)}
              min={80}
              max={200}
              step={10}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ fontSizeScale: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Line Height */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Adjust Line Height"
          description="Increase space between lines"
          checked={settings.lineHeightEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ lineHeightEnabled: checked })
          }
        />

        {settings.lineHeightEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Scale"
              value={settings.lineHeightScale * 10}
              min={10}
              max={30}
              step={1}
              formatValue={(v) => `${(v / 10).toFixed(1)}x`}
              onValueChange={(v) =>
                onSettingsChange({ lineHeightScale: v / 10 })
              }
            />
          </div>
        )}
      </div>

      {/* Letter Spacing */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Adjust Letter Spacing"
          description="Increase space between characters"
          checked={settings.letterSpacingEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ letterSpacingEnabled: checked })
          }
        />

        {settings.letterSpacingEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Spacing"
              value={Math.round(settings.letterSpacing * 100)}
              min={-5}
              max={30}
              step={1}
              formatValue={(v) => `${(v / 100).toFixed(2)}em`}
              onValueChange={(v) =>
                onSettingsChange({ letterSpacing: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Word Spacing */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Adjust Word Spacing"
          description="Increase space between words"
          checked={settings.wordSpacingEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ wordSpacingEnabled: checked })
          }
        />

        {settings.wordSpacingEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Spacing"
              value={Math.round(settings.wordSpacing * 100)}
              min={0}
              max={100}
              step={5}
              formatValue={(v) => `${(v / 100).toFixed(2)}em`}
              onValueChange={(v) =>
                onSettingsChange({ wordSpacing: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Text Alignment */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <SelectSetting
          label="Text Alignment"
          value={settings.textAlign}
          options={TEXT_ALIGN_OPTIONS}
          onValueChange={(v) =>
            onSettingsChange({ textAlign: v as TextAlignment })
          }
        />
      </div>

      {/* Paragraph Width */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Limit Line Width"
          description="Restrict maximum characters per line"
          checked={settings.paragraphWidthEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ paragraphWidthEnabled: checked })
          }
        />

        {settings.paragraphWidthEnabled && (
          <div className="pl-1">
            <SliderSetting
              label="Max Width"
              value={settings.paragraphMaxWidth}
              min={40}
              max={120}
              step={5}
              formatValue={(v) => `${v}ch`}
              onValueChange={(v) =>
                onSettingsChange({ paragraphMaxWidth: v })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
