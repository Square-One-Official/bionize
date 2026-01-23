import {
  BIONIZED_IDENTIFIER,
  BIONIZE_STYLES_ID,
  HIGH_CONTRAST_THEMES,
  COLOR_BLINDNESS_MATRICES,
  FONT_URLS,
} from "../shared/constants";
import { getSettings, getStateForUrl, deepMerge } from "../shared/storage";
import { processText } from "../shared/text-processor";
import type { BionizeSettings, DeepPartial, HighContrastTheme } from "../shared/types";

// ============================================================================
// State Management
// ============================================================================

let isEnabled = false;
let settings: BionizeSettings;
const originalContent = new Map<Element, { html: string; text: string }>();

// ============================================================================
// Mutation Observer
// ============================================================================

const observer = new MutationObserver((mutations) => {
  if (isEnabled && settings.reading.bionicEnabled) {
    const hasNewContent = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          node.nodeType === Node.TEXT_NODE
      )
    );

    if (hasNewContent) {
      processBionicText();
    }
  }
});

// ============================================================================
// Bionic Reading Module
// ============================================================================

function processBionicText() {
  if (!isEnabled || !settings.reading.bionicEnabled) return;

  try {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (
            tagName === "script" ||
            tagName === "style" ||
            tagName === "noscript" ||
            parent.closest(
              "script, style, noscript, button, a, input, select, textarea"
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.hasAttribute(BIONIZED_IDENTIFIER)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent?.trim() || "";
          if (!text || text.split(/\s+/).length < settings.reading.bionicMinWordsInText) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!node || !node.parentElement) continue;

      const parent = node.parentElement;

      if (!originalContent.has(parent)) {
        originalContent.set(parent, {
          html: parent.innerHTML,
          text: node.textContent || "",
        });
      }

      const processedText = processText(node.textContent || "", settings.reading);
      if (processedText !== node.textContent) {
        const span = document.createElement("span");
        span.innerHTML = processedText;
        parent.setAttribute(BIONIZED_IDENTIFIER, "true");
        (node as ChildNode).replaceWith(...Array.from(span.childNodes));
      }
    }
  } catch (error) {
    console.error("Bionize: Error processing text:", error);
  }
}

function revertBionicText() {
  try {
    for (const [element, content] of originalContent.entries()) {
      if (element && element.isConnected) {
        element.innerHTML = content.html;
        element.removeAttribute(BIONIZED_IDENTIFIER);
      }
    }
    originalContent.clear();
  } catch (error) {
    console.error("Bionize: Error reverting text:", error);
  }
}

// ============================================================================
// Vision Module - High Contrast & Color Filters
// ============================================================================

function applyHighContrastMode(mode: HighContrastTheme) {
  removeHighContrastMode();

  if (mode === "off") return;

  const theme = HIGH_CONTRAST_THEMES[mode];
  if (!theme) return;

  const style = document.createElement("style");
  style.id = "bionize-high-contrast";
  style.textContent = `
    html {
      filter: none !important;
    }
    body, body * {
      background-color: ${theme.background} !important;
      color: ${theme.foreground} !important;
      border-color: ${theme.foreground} !important;
    }
    a, a * {
      color: ${theme.link} !important;
    }
    img, video, canvas, svg {
      filter: contrast(1.2) !important;
    }
  `;
  document.head.appendChild(style);
}

function removeHighContrastMode() {
  document.getElementById("bionize-high-contrast")?.remove();
}

function applyColorBlindnessFilter() {
  removeColorBlindnessFilter();

  const filter = settings.vision.colorBlindnessFilter;
  if (filter === "off") return;

  const matrix = COLOR_BLINDNESS_MATRICES[filter];
  if (!matrix) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "bionize-color-filter-svg";
  svg.setAttribute("style", "position: absolute; width: 0; height: 0;");
  svg.innerHTML = `
    <defs>
      <filter id="bionize-colorblind-filter">
        <feColorMatrix type="matrix" values="${matrix.join(" ")}" />
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);

  const style = document.createElement("style");
  style.id = "bionize-color-filter-style";
  const intensity = settings.vision.colorBlindnessIntensity;
  style.textContent = `
    html {
      filter: url(#bionize-colorblind-filter);
      opacity: ${intensity};
    }
  `;
  document.head.appendChild(style);
}

function removeColorBlindnessFilter() {
  document.getElementById("bionize-color-filter-svg")?.remove();
  document.getElementById("bionize-color-filter-style")?.remove();
}

function applyInvertColors() {
  removeInvertColors();

  if (!settings.vision.invertColors) return;

  const style = document.createElement("style");
  style.id = "bionize-invert";
  style.textContent = `
    html {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    img, video, canvas, iframe {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;
  document.head.appendChild(style);
}

function removeInvertColors() {
  document.getElementById("bionize-invert")?.remove();
}

function applyGrayscale() {
  removeGrayscale();

  if (!settings.vision.grayscaleEnabled) return;

  const style = document.createElement("style");
  style.id = "bionize-grayscale";
  style.textContent = `
    html {
      filter: grayscale(${settings.vision.grayscaleIntensity}) !important;
    }
  `;
  document.head.appendChild(style);
}

function removeGrayscale() {
  document.getElementById("bionize-grayscale")?.remove();
}

function applyLinkHighlight() {
  removeLinkHighlight();

  if (!settings.vision.linkHighlightEnabled) return;

  const { linkHighlightStyle, linkHighlightColor } = settings.vision;
  let linkStyles = "";

  switch (linkHighlightStyle) {
    case "underline":
      linkStyles = `
        text-decoration: underline !important;
        text-decoration-color: ${linkHighlightColor} !important;
        text-decoration-thickness: 2px !important;
      `;
      break;
    case "background":
      linkStyles = `
        background-color: ${linkHighlightColor}33 !important;
        padding: 0 2px !important;
      `;
      break;
    case "outline":
      linkStyles = `
        outline: 2px solid ${linkHighlightColor} !important;
        outline-offset: 1px !important;
      `;
      break;
  }

  const style = document.createElement("style");
  style.id = "bionize-link-highlight";
  style.textContent = `
    a, a:visited {
      ${linkStyles}
    }
  `;
  document.head.appendChild(style);
}

function removeLinkHighlight() {
  document.getElementById("bionize-link-highlight")?.remove();
}

// ============================================================================
// Typography Module
// ============================================================================

function applyTypography() {
  removeTypography();

  const { typography } = settings;
  let css = "";

  // Font family
  if (typography.fontFamily !== "system") {
    let fontFamily = "";
    switch (typography.fontFamily) {
      case "opendyslexic":
        loadFont("OpenDyslexic", FONT_URLS.opendyslexic);
        fontFamily = '"OpenDyslexic", sans-serif';
        break;
      case "atkinson":
        loadFont("Atkinson Hyperlegible", FONT_URLS.atkinson);
        fontFamily = '"Atkinson Hyperlegible", sans-serif';
        break;
      case "lexie":
        fontFamily = '"Lexie Readable", sans-serif';
        break;
      case "comic-sans":
        fontFamily = '"Comic Sans MS", cursive';
        break;
      case "custom":
        fontFamily = `"${typography.customFontFamily}", sans-serif`;
        break;
    }
    if (fontFamily) {
      css += `body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
        font-family: ${fontFamily} !important;
      }`;
    }
  }

  // Font size
  if (typography.fontSizeEnabled && typography.fontSizeScale !== 1) {
    css += `html { font-size: ${typography.fontSizeScale * 100}% !important; }`;
  }

  // Line height
  if (typography.lineHeightEnabled) {
    css += `body, p, div, span, li { line-height: ${typography.lineHeightScale} !important; }`;
  }

  // Letter spacing
  if (typography.letterSpacingEnabled && typography.letterSpacing !== 0) {
    css += `body, p, div, span, li { letter-spacing: ${typography.letterSpacing}em !important; }`;
  }

  // Word spacing
  if (typography.wordSpacingEnabled && typography.wordSpacing !== 0) {
    css += `body, p, div, span, li { word-spacing: ${typography.wordSpacing}em !important; }`;
  }

  // Text alignment
  if (typography.textAlign !== "inherit") {
    css += `p, div, li { text-align: ${typography.textAlign} !important; }`;
  }

  // Paragraph width
  if (typography.paragraphWidthEnabled) {
    css += `p, article, .content, main {
      max-width: ${typography.paragraphMaxWidth}ch !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }`;
  }

  if (css) {
    const style = document.createElement("style");
    style.id = "bionize-typography";
    style.textContent = css;
    document.head.appendChild(style);
  }
}

function removeTypography() {
  document.getElementById("bionize-typography")?.remove();
}

function loadFont(name: string, url: string) {
  const existingFont = document.getElementById(`bionize-font-${name.replace(/\s+/g, "-")}`);
  if (existingFont) return;

  const style = document.createElement("style");
  style.id = `bionize-font-${name.replace(/\s+/g, "-")}`;
  style.textContent = `
    @font-face {
      font-family: "${name}";
      src: url("${url}") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// Apply/Remove All Features
// ============================================================================

function applyAllFeatures() {
  if (settings.reading.bionicEnabled) {
    processBionicText();
  }
  applyHighContrastMode(settings.vision.highContrastMode);
  applyColorBlindnessFilter();
  applyInvertColors();
  applyGrayscale();
  applyLinkHighlight();
  applyTypography();
}

function removeAllFeatures() {
  revertBionicText();
  removeHighContrastMode();
  removeColorBlindnessFilter();
  removeInvertColors();
  removeGrayscale();
  removeLinkHighlight();
  removeTypography();
}

// ============================================================================
// Message Handling
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleState") {
    isEnabled = message.state;
    if (isEnabled) {
      applyAllFeatures();
    } else {
      removeAllFeatures();
    }
    sendResponse({ success: true });
  }

  if (message.action === "updateSettings" && message.settings) {
    const newSettings = message.settings as DeepPartial<BionizeSettings>;
    settings = deepMerge(settings, newSettings);

    if (isEnabled) {
      // Re-apply all features with new settings
      removeAllFeatures();
      applyAllFeatures();
    }
    sendResponse({ success: true });
  }

  return true;
});

// ============================================================================
// Initialization
// ============================================================================

async function initialize() {
  try {
    settings = await getSettings();
    isEnabled = await getStateForUrl(window.location.href);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    if (isEnabled) {
      applyAllFeatures();
    }
  } catch (error) {
    console.error("Bionize: Error initializing:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
