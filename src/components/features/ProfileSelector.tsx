import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import type { AccessibilityProfile } from "@/shared/types";
import {
  BookOpen,
  Eye,
  Target,
  Palette,
  User,
  CircleOff,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  eye: Eye,
  target: Target,
  palette: Palette,
  user: User,
};

interface ProfileSelectorProps {
  profiles: AccessibilityProfile[];
  activeProfileId: string | null;
  onProfileChange: (profileId: string | null) => void;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onProfileChange,
}: ProfileSelectorProps) {
  const builtInProfiles = profiles.filter((p) => p.isBuiltIn);
  const customProfiles = profiles.filter((p) => !p.isBuiltIn);

  const handleValueChange = (value: string) => {
    onProfileChange(value === "none" ? null : value);
  };

  return (
    <Select
      value={activeProfileId || "none"}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder="Select a profile" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <div className="flex items-center gap-2">
            <CircleOff className="h-4 w-4 text-muted-foreground" />
            <span>No Profile</span>
          </div>
        </SelectItem>

        <SelectSeparator />

        {builtInProfiles.map((profile) => {
          const Icon = ICON_MAP[profile.icon] || User;
          return (
            <SelectItem key={profile.id} value={profile.id}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{profile.name}</span>
              </div>
            </SelectItem>
          );
        })}

        {customProfiles.length > 0 && (
          <>
            <SelectSeparator />
            {customProfiles.map((profile) => {
              const Icon = ICON_MAP[profile.icon] || User;
              return (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
