// Storage related constants
export const STORAGE_PREFIX = "bionize_";
export const STORAGE_SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
export const STORAGE_STATE_PREFIX = `${STORAGE_PREFIX}state_`;
export const STORAGE_PROFILES_KEY = `${STORAGE_PREFIX}profiles`;
export const STORAGE_SITE_OVERRIDE_PREFIX = `${STORAGE_PREFIX}site_`;

// DOM related constants
export const BIONIZED_IDENTIFIER = "data-bionized";
export const BIONIZED_CLASS = "bionized-text";

// Bionize element IDs (for content script injected elements)
export const BIONIZE_READING_RULER_ID = "bionize-reading-ruler";
export const BIONIZE_LINE_FOCUS_ID = "bionize-line-focus";
export const BIONIZE_COLOR_FILTER_ID = "bionize-color-filter";
export const BIONIZE_QUICK_TOOLBAR_ID = "bionize-quick-toolbar";
export const BIONIZE_STYLES_ID = "bionize-injected-styles";

// Font CDN URLs
export const FONT_URLS = {
  opendyslexic:
    "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.woff2",
  atkinson:
    "https://cdn.jsdelivr.net/npm/@fontsource/atkinson-hyperlegible@5.0.3/files/atkinson-hyperlegible-latin-400-normal.woff2",
};

// High contrast theme CSS
export const HIGH_CONTRAST_THEMES = {
  dark: {
    background: "#000000",
    foreground: "#ffffff",
    link: "#ffff00",
  },
  light: {
    background: "#ffffff",
    foreground: "#000000",
    link: "#0000ff",
  },
  "yellow-black": {
    background: "#000000",
    foreground: "#ffff00",
    link: "#00ffff",
  },
  "black-yellow": {
    background: "#ffff00",
    foreground: "#000000",
    link: "#0000ff",
  },
  "white-blue": {
    background: "#000080",
    foreground: "#ffffff",
    link: "#ffff00",
  },
};

// Color blindness filter matrices (for SVG feColorMatrix)
export const COLOR_BLINDNESS_MATRICES = {
  deuteranopia: [
    0.625, 0.375, 0, 0, 0,
    0.7, 0.3, 0, 0, 0,
    0, 0.3, 0.7, 0, 0,
    0, 0, 0, 1, 0,
  ],
  protanopia: [
    0.567, 0.433, 0, 0, 0,
    0.558, 0.442, 0, 0, 0,
    0, 0.242, 0.758, 0, 0,
    0, 0, 0, 1, 0,
  ],
  tritanopia: [
    0.95, 0.05, 0, 0, 0,
    0, 0.433, 0.567, 0, 0,
    0, 0.475, 0.525, 0, 0,
    0, 0, 0, 1, 0,
  ],
  achromatopsia: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0,
  ],
};

// Menu items
export const MENU_ITEMS = [
  {
    id: "bionize_feedback",
    title: "Feedback",
    url: "https://0zitr0ubvu5.typeform.com/to/DLyGSj12",
  },
  {
    id: "bionize_feature_wishlist",
    title: "Feature wishlist",
    url: "https://bionize.nolt.io/",
  },
  {
    id: "bionize_buy_coffee",
    title: "Buy us a coffee",
    url: "https://www.buymeacoffee.com/squareone",
  },
];
