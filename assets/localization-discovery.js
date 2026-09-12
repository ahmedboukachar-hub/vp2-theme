/*
  Localization discovery — automatic language detection.

  Decision order (see docs/localization-discovery.md):
    1. stored visitor preference (manual always wins, auto never re-runs)
    2. explicit locale in the opened URL
    3. browser/device languages (navigator.languages)
    4. English (primary) as final fallback

  Only the language is ever changed — never country, Market, currency or tax
  context. Switching uses Shopify's native localization form so Shopify
  resolves the correct locale route for the current resource (return_to).
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'locale-preference';
  var VERSION = 1;
  function normalizeLanguageTag(tag) {
    return String(tag || '').split('-')[0].toLowerCase();
  }

  // First supported language from an ordered browser preference list, or null.
  function resolveFromBrowser(preferredTags, availableLocales) {
    for (var i = 0; i < (preferredTags || []).length; i++) {
      var code = normalizeLanguageTag(preferredTags[i]);
      if (availableLocales.indexOf(code) !== -1) return code;
    }
    return null;
  }

  var api = {
    normalizeLanguageTag: normalizeLanguageTag,
    resolveFromBrowser: resolveFromBrowser,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window === 'undefined') return;
  window.LocalizationDiscovery = api;
  if (typeof document === 'undefined') return;

  function readPreference() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.locale ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function writePreference(preference) {
    try {
      preference.v = VERSION;
      preference.ts = Date.now();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
      return window.localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  function safeReturnTo() {
    var path = window.location.pathname + window.location.search;
    if (path.charAt(0) !== '/' || path.charAt(1) === '/') return '/';
    return path;
  }

  function init() {
    // Never interfere with the Theme Editor or theme previews.
    if (window.Shopify && window.Shopify.designMode) return;
    if (window.location.search.indexOf('preview_theme_id') !== -1) return;

    var configElement = document.getElementById('LocalizationDiscoveryConfig');
    if (!configElement) return;
    var config;
    try {
      config = JSON.parse(configElement.textContent);
    } catch (error) {
      return;
    }

    // Manual selections via any native localization language form always win:
    // store them so automatic detection never overrides the visitor again.
    document.addEventListener(
      'submit',
      function (event) {
        var form = event.target;
        if (!form || form.id === 'LocalizationDiscoveryForm') return;
        var localeInput = form.querySelector && form.querySelector('input[name="locale_code"]');
        if (!localeInput || !localeInput.value) return;
        writePreference({ locale: normalizeLanguageTag(localeInput.value), source: 'manual' });
      },
      true
    );

    var preference = readPreference();

    if (preference) return;

    // Explicit locale route opened (e.g. a shared /de link): respect it, do nothing.
    if (!config.currentIsPrimary) return;

    if (!config.autoDetect) return;

    // Without working storage an automatic switch could repeat on every visit.
    if (!writePreference({ locale: config.currentLocale, source: 'probe' })) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      return;
    }

    var preferredTags = navigator.languages && navigator.languages.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];

    var fromBrowser = resolveFromBrowser(preferredTags, config.availableLocales);
    if (fromBrowser) {
      applyDecision(fromBrowser, 'browser');
      return;
    }

    applyDecision(config.primaryLocale, 'default');

    function applyDecision(targetLocale, via) {
      if (targetLocale === config.currentLocale) {
        // Best match is already showing: remember it, never redirect or repeat.
        writePreference({ locale: targetLocale, source: 'auto', via: via });
        return;
      }
      switchLocale(targetLocale, via);
    }

    function switchLocale(targetLocale, via) {
      // Store first so the localized page never re-triggers detection (no loops).
      if (!writePreference({ locale: targetLocale, source: 'auto', via: via })) return;
      var form = document.getElementById('LocalizationDiscoveryForm');
      if (!form) return;
      var localeInput = form.querySelector('input[name="locale_code"]');
      if (!localeInput) return;
      localeInput.value = targetLocale;
      var returnToInput = form.querySelector('input[name="return_to"]');
      if (returnToInput) returnToInput.value = safeReturnTo();
      form.submit();
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
