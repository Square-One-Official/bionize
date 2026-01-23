// ============================================================================
// Bionize Accessibility Toolkit - Type Definitions
// ============================================================================

// ----------------------------------------------------------------------------
// Settings Interfaces
// ----------------------------------------------------------------------------

export interface ReadingSettings {
  // Bionic Reading
  bionicEnabled: boolean;
  bionicOpacity: number; // 0.1 - 0.9
  bionicFocusRatio: number; // 0.4 - 0.8
  bionicMinWordLength: number;
  bionicMinWordsInText: number;

  // Reading Ruler
  readingRulerEnabled: boolean;
  readingRulerHeight: number; // px
  readingRulerColor: string; // hex color
  readingRulerOpacity: number; // 0.1 - 0.9

  // Line Focus
  lineFocusEnabled: boolean;
  lineFocusDimOpacity: number; // 0.1 - 0.5
  lineFocusLines: number; // 1-5 lines

  // Text-to-Speech
  ttsEnabled: boolean;
  ttsRate: number; // 0.5 - 2.0
  ttsVoice: string;
}

export interface VisionSettings {
  // High Contrast
  highContrastMode: HighContrastTheme;

  // Color Blindness
  colorBlindnessFilter: ColorBlindnessFilter;
  colorBlindnessIntensity: number; // 0.5 - 1.0

  // Color Adjustments
  invertColors: boolean;
  grayscaleEnabled: boolean;
  grayscaleIntensity: number; // 0.5 - 1.0

  // Link Highlighting
  linkHighlightEnabled: boolean;
  linkHighlightStyle: LinkHighlightStyle;
  linkHighlightColor: string; // hex color
}

export interface TypographySettings {
  // Font Family
  fontFamily: FontFamily;
  customFontFamily: string;

  // Font Size
  fontSizeEnabled: boolean;
  fontSizeScale: number; // 0.8 - 2.0

  // Spacing
  lineHeightEnabled: boolean;
  lineHeightScale: number; // 1.0 - 3.0
  letterSpacingEnabled: boolean;
  letterSpacing: number; // -0.05 - 0.3 em
  wordSpacingEnabled: boolean;
  wordSpacing: number; // 0 - 1.0 em

  // Layout
  textAlign: TextAlignment;
  paragraphWidthEnabled: boolean;
  paragraphMaxWidth: number; // ch (characters)
}

export interface UISettings {
  // Quick Toolbar
  quickToolbarEnabled: boolean;
  quickToolbarPosition: ToolbarPosition;
  quickToolbarFeatures: string[]; // Feature IDs

  // Extension UI
  popupExpandedSections: string[];
}

// ----------------------------------------------------------------------------
// Enum Types
// ----------------------------------------------------------------------------

export type HighContrastTheme =
  | "off"
  | "dark"
  | "light"
  | "yellow-black"
  | "black-yellow"
  | "white-blue";

export type ColorBlindnessFilter =
  | "off"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia"
  | "achromatopsia";

export type LinkHighlightStyle = "underline" | "background" | "outline";

export type FontFamily =
  | "system"
  | "opendyslexic"
  | "atkinson"
  | "lexie"
  | "comic-sans"
  | "custom";

export type TextAlignment = "left" | "justify" | "inherit";

export type ToolbarPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// ----------------------------------------------------------------------------
// Main Settings Interface
// ----------------------------------------------------------------------------

export interface BionizeSettings {
  // Global
  version: number; // Settings schema version for migrations

  // Category Settings
  reading: ReadingSettings;
  vision: VisionSettings;
  typography: TypographySettings;
  ui: UISettings;

  // Active Profile
  activeProfileId: string | null;
}

// ----------------------------------------------------------------------------
// Profile System
// ----------------------------------------------------------------------------

export interface AccessibilityProfile {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  isBuiltIn: boolean;
  createdAt: number;
  settings: DeepPartial<Omit<BionizeSettings, "version" | "activeProfileId" | "ui">>;
}

// Helper type for partial nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ----------------------------------------------------------------------------
// Default Values
// ----------------------------------------------------------------------------

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  bionicEnabled: false,
  bionicOpacity: 0.35,
  bionicFocusRatio: 0.6,
  bionicMinWordLength: 3,
  bionicMinWordsInText: 15,
  readingRulerEnabled: false,
  readingRulerHeight: 40,
  readingRulerColor: "#fef08a",
  readingRulerOpacity: 0.4,
  lineFocusEnabled: false,
  lineFocusDimOpacity: 0.15,
  lineFocusLines: 3,
  ttsEnabled: false,
  ttsRate: 1.0,
  ttsVoice: "default",
};

export const DEFAULT_VISION_SETTINGS: VisionSettings = {
  highContrastMode: "off",
  colorBlindnessFilter: "off",
  colorBlindnessIntensity: 1.0,
  invertColors: false,
  grayscaleEnabled: false,
  grayscaleIntensity: 1.0,
  linkHighlightEnabled: false,
  linkHighlightStyle: "underline",
  linkHighlightColor: "#3b82f6",
};

export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  fontFamily: "system",
  customFontFamily: "",
  fontSizeEnabled: false,
  fontSizeScale: 1.0,
  lineHeightEnabled: false,
  lineHeightScale: 1.5,
  letterSpacingEnabled: false,
  letterSpacing: 0,
  wordSpacingEnabled: false,
  wordSpacing: 0,
  textAlign: "inherit",
  paragraphWidthEnabled: false,
  paragraphMaxWidth: 80,
};

export const DEFAULT_UI_SETTINGS: UISettings = {
  quickToolbarEnabled: false,
  quickToolbarPosition: "bottom-right",
  quickToolbarFeatures: ["bionicEnabled", "readingRulerEnabled", "highContrastMode"],
  popupExpandedSections: ["reading"],
};

export const DEFAULT_SETTINGS: BionizeSettings = {
  version: 1,
  reading: DEFAULT_READING_SETTINGS,
  vision: DEFAULT_VISION_SETTINGS,
  typography: DEFAULT_TYPOGRAPHY_SETTINGS,
  ui: DEFAULT_UI_SETTINGS,
  activeProfileId: null,
};

// ----------------------------------------------------------------------------
// Built-in Profiles
// ----------------------------------------------------------------------------

export const BUILT_IN_PROFILES: AccessibilityProfile[] = [
  {
    id: "dyslexia",
    name: "Dyslexia Support",
    icon: "book-open",
    description: "OpenDyslexic font, bionic reading, increased spacing",
    isBuiltIn: true,
    createdAt: 0,
    settings: {
      reading: {
        bionicEnabled: true,
        bionicOpacity: 0.4,
        bionicFocusRatio: 0.5,
      },
      typography: {
        fontFamily: "opendyslexic",
        lineHeightEnabled: true,
        lineHeightScale: 1.8,
        letterSpacingEnabled: true,
        letterSpacing: 0.1,
        wordSpacingEnabled: true,
        wordSpacing: 0.2,
        paragraphWidthEnabled: true,
        paragraphMaxWidth: 70,
      },
    },
  },
  {
    id: "low-vision",
    name: "Low Vision",
    icon: "eye",
    description: "High contrast, larger text, enhanced links",
    isBuiltIn: true,
    createdAt: 0,
    settings: {
      vision: {
        highContrastMode: "dark",
        linkHighlightEnabled: true,
        linkHighlightStyle: "background",
      },
      typography: {
        fontSizeEnabled: true,
        fontSizeScale: 1.4,
        lineHeightEnabled: true,
        lineHeightScale: 1.8,
      },
    },
  },
  {
    id: "adhd-focus",
    name: "ADHD Focus",
    icon: "target",
    description: "Line focus, reading ruler, reduced distractions",
    isBuiltIn: true,
    createdAt: 0,
    settings: {
      reading: {
        lineFocusEnabled: true,
        lineFocusDimOpacity: 0.2,
        lineFocusLines: 2,
        readingRulerEnabled: true,
      },
      typography: {
        paragraphWidthEnabled: true,
        paragraphMaxWidth: 65,
      },
    },
  },
  {
    id: "color-blind",
    name: "Color Blind",
    icon: "palette",
    description: "Color correction filters, enhanced link visibility",
    isBuiltIn: true,
    createdAt: 0,
    settings: {
      vision: {
        colorBlindnessFilter: "deuteranopia",
        linkHighlightEnabled: true,
        linkHighlightStyle: "underline",
        linkHighlightColor: "#fbbf24",
      },
    },
  },
];

// ----------------------------------------------------------------------------
// Message Types
// ----------------------------------------------------------------------------

export type MessageType =
  | { action: "toggleExtension"; enabled: boolean }
  | { action: "applyProfile"; profileId: string | null }
  | { action: "updateSettings"; settings: DeepPartial<BionizeSettings> }
  | { action: "updateCategorySettings"; category: keyof Pick<BionizeSettings, "reading" | "vision" | "typography" | "ui">; settings: unknown }
  | { action: "getSettings" }
  | { action: "getProfiles" }
  | { action: "saveProfile"; profile: AccessibilityProfile }
  | { action: "deleteProfile"; profileId: string }
  | { action: "triggerTTS"; text?: string }
  | { action: "stopTTS" }
  | { action: "getState" };

export type ResponseType =
  | { success: boolean; settings?: BionizeSettings }
  | { success: boolean; profiles?: AccessibilityProfile[] }
  | { success: boolean; state?: boolean }
  | { success: boolean; error?: string };

// ----------------------------------------------------------------------------
// Legacy Compatibility (for migration)
// ----------------------------------------------------------------------------

export interface LegacyBionizeSettings {
  enabled: boolean;
  opacity: number;
  focusRatio: number;
  minWordLength: number;
  minWordsInText: number;
  customFontEnabled: boolean;
  customFontFamily: string;
  customFontSize: number;
  darkMode: boolean;
  highContrastMode: boolean;
  dyslexicFontMode: boolean;
}
