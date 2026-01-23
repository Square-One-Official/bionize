import type { ReadingSettings } from "./types";

/**
 * Processes a word to create bionic reading enhancement
 * @param word The word to process
 * @param settings Reading settings
 * @returns Enhanced HTML for the word
 */
export function processWord(word: string, settings: ReadingSettings): string {
  if (!word || word.length <= settings.bionicMinWordLength) {
    return word;
  }

  // Calculate focus length - how much of the word will be in focus
  const wordLength = trimSpecialChars(word).length;
  const focusLength = Math.ceil(wordLength * settings.bionicFocusRatio);

  // Split the word into focused part and faded part
  const focusPart = word.slice(0, focusLength);
  const fadePart = word.slice(focusLength);

  if (!fadePart) {
    return focusPart;
  }

  return `${focusPart}<span style="opacity: ${settings.bionicOpacity};">${fadePart}</span>`;
}

/**
 * Processes an entire text for bionic reading
 * @param text The text to process
 * @param settings Reading settings
 * @returns Enhanced HTML for the text
 */
export function processText(text: string, settings: ReadingSettings): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  const words = text.trim().split(/\s+/);

  if (words.length < settings.bionicMinWordsInText) {
    return text;
  }

  return words.map((word) => processWord(word, settings)).join(" ");
}

/**
 * Removes special characters that shouldn't count towards word length
 * @param word The word to trim
 * @returns Trimmed word
 */
function trimSpecialChars(word: string): string {
  return word.replace(/[,.\(\)\[\]{}!?:;'"\-_]/g, "");
}
