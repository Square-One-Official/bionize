import {
  BionizeSettings,
  DEFAULT_SETTINGS,
  AccessibilityProfile,
  BUILT_IN_PROFILES,
  DeepPartial,
  LegacyBionizeSettings,
} from "./types";
import {
  STORAGE_SETTINGS_KEY,
  STORAGE_STATE_PREFIX,
  STORAGE_PROFILES_KEY,
  STORAGE_SITE_OVERRIDE_PREFIX,
} from "./constants";

// ============================================================================
// Helper Functions
// ============================================================================

export function getHostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error("Error extracting hostname:", error);
    return url;
  }
}

export function getStateStorageKey(url: string): string {
  const hostname = getHostnameFromUrl(url);
  return `${STORAGE_STATE_PREFIX}${hostname}`;
}

export function getSiteOverrideKey(url: string): string {
  const hostname = getHostnameFromUrl(url);
  return `${STORAGE_SITE_OVERRIDE_PREFIX}${hostname}`;
}

// Deep merge utility for nested settings objects
export function deepMerge<T extends object>(
  target: T,
  source: DeepPartial<T>
): T {
  const result = { ...target } as T;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key as keyof typeof source];
      const targetValue = target[key as keyof T];

      if (
        sourceValue !== undefined &&
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as object,
          sourceValue as DeepPartial<object>
        );
      } else if (sourceValue !== undefined) {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

// ============================================================================
// Settings Migration
// ============================================================================

function isLegacySettings(settings: unknown): settings is LegacyBionizeSettings {
  return (
    typeof settings === "object" &&
    settings !== null &&
    "opacity" in settings &&
    !("version" in settings) &&
    !("reading" in settings)
  );
}

function migrateLegacySettings(legacy: LegacyBionizeSettings): BionizeSettings {
  return {
    version: 1,
    reading: {
      ...DEFAULT_SETTINGS.reading,
      bionicEnabled: legacy.enabled,
      bionicOpacity: legacy.opacity,
      bionicFocusRatio: legacy.focusRatio,
      bionicMinWordLength: legacy.minWordLength,
      bionicMinWordsInText: legacy.minWordsInText,
    },
    vision: {
      ...DEFAULT_SETTINGS.vision,
      highContrastMode: legacy.highContrastMode ? "dark" : "off",
    },
    typography: {
      ...DEFAULT_SETTINGS.typography,
      fontFamily: legacy.dyslexicFontMode
        ? "opendyslexic"
        : legacy.customFontEnabled
          ? "custom"
          : "system",
      customFontFamily: legacy.customFontFamily,
      fontSizeEnabled: legacy.customFontEnabled && legacy.customFontSize !== 16,
      fontSizeScale: legacy.customFontSize / 16,
      lineHeightEnabled: legacy.dyslexicFontMode,
      lineHeightScale: legacy.dyslexicFontMode ? 1.8 : 1.5,
      letterSpacingEnabled: legacy.dyslexicFontMode,
      letterSpacing: legacy.dyslexicFontMode ? 0.1 : 0,
    },
    ui: DEFAULT_SETTINGS.ui,
    activeProfileId: null,
  };
}

// ============================================================================
// Settings CRUD
// ============================================================================

export async function getSettings(): Promise<BionizeSettings> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_SETTINGS_KEY);
    const stored = result[STORAGE_SETTINGS_KEY];

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    // Handle legacy settings migration
    if (isLegacySettings(stored)) {
      const migrated = migrateLegacySettings(stored);
      await saveSettings(migrated);
      return migrated;
    }

    // Merge with defaults to handle any new settings
    return deepMerge(DEFAULT_SETTINGS, stored as DeepPartial<BionizeSettings>);
  } catch (error) {
    console.error("Error retrieving settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: DeepPartial<BionizeSettings>
): Promise<boolean> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = deepMerge(currentSettings, settings);
    await chrome.storage.sync.set({ [STORAGE_SETTINGS_KEY]: updatedSettings });
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
}

export async function resetSettings(): Promise<boolean> {
  try {
    await chrome.storage.sync.set({ [STORAGE_SETTINGS_KEY]: DEFAULT_SETTINGS });
    return true;
  } catch (error) {
    console.error("Error resetting settings:", error);
    return false;
  }
}

// ============================================================================
// Per-Site State
// ============================================================================

export async function getStateForUrl(url: string): Promise<boolean> {
  try {
    const key = getStateStorageKey(url);
    const result = await chrome.storage.sync.get(key);
    return result[key] || false;
  } catch (error) {
    console.error("Error retrieving state:", error);
    return false;
  }
}

export async function setStateForUrl(
  url: string,
  state: boolean
): Promise<boolean> {
  try {
    const key = getStateStorageKey(url);
    await chrome.storage.sync.set({ [key]: state });
    return true;
  } catch (error) {
    console.error("Error setting state:", error);
    return false;
  }
}

// ============================================================================
// Per-Site Overrides
// ============================================================================

export async function getSiteOverrides(
  url: string
): Promise<DeepPartial<BionizeSettings> | null> {
  try {
    const key = getSiteOverrideKey(url);
    const result = await chrome.storage.sync.get(key);
    return result[key] || null;
  } catch (error) {
    console.error("Error retrieving site overrides:", error);
    return null;
  }
}

export async function saveSiteOverrides(
  url: string,
  overrides: DeepPartial<BionizeSettings>
): Promise<boolean> {
  try {
    const key = getSiteOverrideKey(url);
    await chrome.storage.sync.set({ [key]: overrides });
    return true;
  } catch (error) {
    console.error("Error saving site overrides:", error);
    return false;
  }
}

export async function clearSiteOverrides(url: string): Promise<boolean> {
  try {
    const key = getSiteOverrideKey(url);
    await chrome.storage.sync.remove(key);
    return true;
  } catch (error) {
    console.error("Error clearing site overrides:", error);
    return false;
  }
}

// Get effective settings for a URL (global merged with site overrides)
export async function getEffectiveSettings(
  url: string
): Promise<BionizeSettings> {
  const globalSettings = await getSettings();
  const siteOverrides = await getSiteOverrides(url);

  if (!siteOverrides) {
    return globalSettings;
  }

  return deepMerge(globalSettings, siteOverrides);
}

// ============================================================================
// Profile Management
// ============================================================================

export async function getProfiles(): Promise<AccessibilityProfile[]> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_PROFILES_KEY);
    const customProfiles: AccessibilityProfile[] = result[STORAGE_PROFILES_KEY] || [];

    // Always include built-in profiles first
    return [...BUILT_IN_PROFILES, ...customProfiles];
  } catch (error) {
    console.error("Error retrieving profiles:", error);
    return BUILT_IN_PROFILES;
  }
}

export async function getCustomProfiles(): Promise<AccessibilityProfile[]> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_PROFILES_KEY);
    return result[STORAGE_PROFILES_KEY] || [];
  } catch (error) {
    console.error("Error retrieving custom profiles:", error);
    return [];
  }
}

export async function saveProfile(
  profile: AccessibilityProfile
): Promise<boolean> {
  try {
    // Cannot save built-in profiles
    if (profile.isBuiltIn) {
      console.error("Cannot modify built-in profiles");
      return false;
    }

    const customProfiles = await getCustomProfiles();
    const existingIndex = customProfiles.findIndex((p) => p.id === profile.id);

    if (existingIndex >= 0) {
      customProfiles[existingIndex] = profile;
    } else {
      customProfiles.push(profile);
    }

    await chrome.storage.sync.set({ [STORAGE_PROFILES_KEY]: customProfiles });
    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    return false;
  }
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    // Cannot delete built-in profiles
    if (BUILT_IN_PROFILES.some((p) => p.id === profileId)) {
      console.error("Cannot delete built-in profiles");
      return false;
    }

    const customProfiles = await getCustomProfiles();
    const filtered = customProfiles.filter((p) => p.id !== profileId);

    await chrome.storage.sync.set({ [STORAGE_PROFILES_KEY]: filtered });
    return true;
  } catch (error) {
    console.error("Error deleting profile:", error);
    return false;
  }
}

export async function getProfileById(
  profileId: string
): Promise<AccessibilityProfile | null> {
  const allProfiles = await getProfiles();
  return allProfiles.find((p) => p.id === profileId) || null;
}

export async function applyProfile(
  profileId: string | null
): Promise<BionizeSettings> {
  const currentSettings = await getSettings();

  if (!profileId) {
    // Clear profile, reset to defaults but keep UI settings
    const resetSettings: BionizeSettings = {
      ...DEFAULT_SETTINGS,
      ui: currentSettings.ui,
      activeProfileId: null,
    };
    await saveSettings(resetSettings);
    return resetSettings;
  }

  const profile = await getProfileById(profileId);
  if (!profile) {
    console.error("Profile not found:", profileId);
    return currentSettings;
  }

  // Apply profile settings while preserving UI preferences
  const newSettings = deepMerge(DEFAULT_SETTINGS, {
    ...profile.settings,
    ui: currentSettings.ui,
    activeProfileId: profileId,
  } as DeepPartial<BionizeSettings>);

  await saveSettings(newSettings);
  return newSettings;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateProfileId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createCustomProfile(
  name: string,
  settings: DeepPartial<BionizeSettings>,
  icon = "user"
): AccessibilityProfile {
  return {
    id: generateProfileId(),
    name,
    icon,
    description: "Custom profile",
    isBuiltIn: false,
    createdAt: Date.now(),
    settings: {
      reading: settings.reading,
      vision: settings.vision,
      typography: settings.typography,
    },
  };
}
