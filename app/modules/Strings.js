import { DEBUG } from "./Debug.js";

class Localization {
  static localizedData = {}; // Cache for loaded localizations
  static language = navigator.language.split('-')[0]; // e.g., "en"
  static fallbackLanguage = "en"; // Default fallback language
  static isLoaded = false;

  /**
   * Preload localization files asynchronously.
   */
  static async preloadLocalizations() {
    if (Object.keys(this.localizedData).length > 0) {
      return; // Already loaded
    }

    try {
      const response = await fetch(`./locales/${this.language}.json`);
      if (!response.ok) throw new Error(`Failed to load ${this.language}`);
      this.localizedData[this.language] = await response.json();
    } catch (error) {
      console.warn(`Failed to load "${this.language}". Falling back to "${this.fallbackLanguage}".`);
      try {
        const fallbackResponse = await fetch(`./locales/${this.fallbackLanguage}.json`);
        if (!fallbackResponse.ok) throw new Error(`Failed to load fallback`);
        this.localizedData[this.fallbackLanguage] = await fallbackResponse.json();
      } catch (fallbackError) {
        console.error(`Failed to load fallback localization:`, fallbackError);
        this.localizedData[this.fallbackLanguage] = {}; // Fallback to empty object
      }
    }

    this.isLoaded = true;
  }

  /**
   * Get a localized string. Falls back to fallback-language data, then to the bare key
   * (so client-facing UI never shows a "[Missing: …]" literal in production).
   * Logs a warning the first time each missing key is observed.
   */
  static _missingKeysReported = new Set();
  static get(key) {
    const primary = this.localizedData[this.language];
    const fallback = this.localizedData[this.fallbackLanguage];
    if (primary && key in primary) return primary[key];
    if (fallback && key in fallback) return fallback[key];

    if (!this._missingKeysReported.has(key)) {
      this._missingKeysReported.add(key);
      console.warn(`STRINGS: missing localization key "${key}"`);
    }
    return key;
  }
}

// Export a promise that resolves when preloading is complete
export const LocalizationReady = Localization.preloadLocalizations();

// Proxy for accessing localized strings
export const STRINGS = new Proxy({}, {
  get(target, prop) {
    if (!Localization.isLoaded) {
      console.warn(`Localization not yet loaded for "${prop}".`);
      return prop;
    }
    return Localization.get(prop);
  }
});
