import React from "react";
import { ToggleSetting, SliderSetting, ColorSetting } from "./SettingRow";
import type { ReadingSettings } from "@/shared/types";

interface ReadingSectionProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: Partial<ReadingSettings>) => void;
}

export function ReadingSection({
  settings,
  onSettingsChange,
}: ReadingSectionProps) {
  return (
    <div className="space-y-4">
      {/* Bionic Reading */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Bionic Reading"
          checked={settings.bionicEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ bionicEnabled: checked })
          }
        />

        {settings.bionicEnabled && (
          <div className="space-y-3 pl-1">
            <SliderSetting
              label="Opacity"
              value={Math.round(settings.bionicOpacity * 100)}
              min={10}
              max={90}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ bionicOpacity: v / 100 })
              }
            />
            <SliderSetting
              label="Focus Ratio"
              value={Math.round(settings.bionicFocusRatio * 100)}
              min={40}
              max={80}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ bionicFocusRatio: v / 100 })
              }
            />
          </div>
        )}
      </div>

      {/* Reading Ruler */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Reading Ruler"
          description="Horizontal guide that follows your cursor"
          checked={settings.readingRulerEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ readingRulerEnabled: checked })
          }
        />

        {settings.readingRulerEnabled && (
          <div className="space-y-3 pl-1">
            <SliderSetting
              label="Height"
              value={settings.readingRulerHeight}
              min={20}
              max={100}
              step={5}
              formatValue={(v) => `${v}px`}
              onValueChange={(v) =>
                onSettingsChange({ readingRulerHeight: v })
              }
            />
            <SliderSetting
              label="Opacity"
              value={Math.round(settings.readingRulerOpacity * 100)}
              min={10}
              max={80}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ readingRulerOpacity: v / 100 })
              }
            />
            <ColorSetting
              label="Color"
              value={settings.readingRulerColor}
              onValueChange={(v) =>
                onSettingsChange({ readingRulerColor: v })
              }
            />
          </div>
        )}
      </div>

      {/* Line Focus */}
      <div className="space-y-3 rounded-lg bg-muted/30 p-3">
        <ToggleSetting
          label="Line Focus"
          description="Dim surrounding lines to focus on current line"
          checked={settings.lineFocusEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ lineFocusEnabled: checked })
          }
        />

        {settings.lineFocusEnabled && (
          <div className="space-y-3 pl-1">
            <SliderSetting
              label="Visible Lines"
              value={settings.lineFocusLines}
              min={1}
              max={5}
              step={1}
              formatValue={(v) => `${v}`}
              onValueChange={(v) =>
                onSettingsChange({ lineFocusLines: v })
              }
            />
            <SliderSetting
              label="Dim Intensity"
              value={Math.round(settings.lineFocusDimOpacity * 100)}
              min={5}
              max={50}
              step={5}
              formatValue={(v) => `${v}%`}
              onValueChange={(v) =>
                onSettingsChange({ lineFocusDimOpacity: v / 100 })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
