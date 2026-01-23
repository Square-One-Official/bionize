import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BaseSettingRowProps {
  label: string;
  description?: string;
  className?: string;
}

// Toggle Setting
interface ToggleSettingRowProps extends BaseSettingRowProps {
  type: "toggle";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

// Slider Setting
interface SliderSettingRowProps extends BaseSettingRowProps {
  type: "slider";
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  onValueChange: (value: number) => void;
}

// Select Setting
interface SelectOption {
  value: string;
  label: string;
}

interface SelectSettingRowProps extends BaseSettingRowProps {
  type: "select";
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
}

// Color Setting
interface ColorSettingRowProps extends BaseSettingRowProps {
  type: "color";
  value: string;
  onValueChange: (value: string) => void;
}

type SettingRowProps =
  | ToggleSettingRowProps
  | SliderSettingRowProps
  | SelectSettingRowProps
  | ColorSettingRowProps;

export function SettingRow(props: SettingRowProps) {
  const { label, description, className } = props;

  return (
    <div className={cn("space-y-2", className)}>
      {props.type === "toggle" && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">{label}</label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            checked={props.checked}
            onCheckedChange={props.onCheckedChange}
            aria-label={label}
          />
        </div>
      )}

      {props.type === "slider" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{label}</label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {props.formatValue
                ? props.formatValue(props.value)
                : props.value}
            </span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <Slider
            value={[props.value]}
            min={props.min}
            max={props.max}
            step={props.step || 1}
            onValueChange={(values) => props.onValueChange(values[0])}
            aria-label={label}
          />
        </div>
      )}

      {props.type === "select" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">{label}</label>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <Select value={props.value} onValueChange={props.onValueChange}>
              <SelectTrigger className="h-8 w-auto min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {props.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {props.type === "color" && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">{label}</label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <input
            type="color"
            value={props.value}
            onChange={(e) => props.onValueChange(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent"
            aria-label={label}
          />
        </div>
      )}
    </div>
  );
}

// Convenience components for common setting patterns
export function ToggleSetting(
  props: Omit<ToggleSettingRowProps, "type">
) {
  return <SettingRow type="toggle" {...props} />;
}

export function SliderSetting(
  props: Omit<SliderSettingRowProps, "type">
) {
  return <SettingRow type="slider" {...props} />;
}

export function SelectSetting(
  props: Omit<SelectSettingRowProps, "type">
) {
  return <SettingRow type="select" {...props} />;
}

export function ColorSetting(
  props: Omit<ColorSettingRowProps, "type">
) {
  return <SettingRow type="color" {...props} />;
}
