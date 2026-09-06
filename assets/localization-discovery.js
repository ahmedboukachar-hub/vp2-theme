/*
  Localization discovery — automatic language detection.

  Decision order (see docs/localization-discovery.md):
    1. stored visitor preference (manual always wins, auto never re-runs)
    2. explicit locale in the opened URL
    3. browser/device languages (navigator.languages)
    4. Shopify browsing context suggestion (country) as cautious fallback
    5. English (primary) as final fallback

  Only the language is ever changed — never country, Market, currency or tax
  context. Switching uses Shopify's native localization form so Shopify
  resolves the correct locale route for the current resource (return_to).
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'locale-preference';
  var VERSION = 1;
  // Cautious country fallback only; multilingual countries (BE, CH, LU, CA…)
  // are intentionally absent and resolve to the primary language.
  var COUNTRY_LANGUAGE_FALLBACK = { NL: 'nl', DE: 'de', AT: 'de', FR: 'fr' };

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

  // Country fallback: mapped language when supported, otherwise the primary.
  function resolveFromCountry(countryCode, availableLocales, primaryLocale) {
    var mapped = COUNTRY_LANGUAGE_FALLBACK[String(countryCode || '').toUpperCase()];
    if (mapped && availableLocales.indexOf(mapped) !== -1) return mapped;
    return primaryLocale;
  }

  // Full decision, pure and testable.
  function resolveTargetLocale(input) {
    var fromBrowser = resolveFromBrowser(input.preferredTags, input.availableLocales);
    if (fromBrowser) return { locale: fromBrowser, via: 'browser' };
    if (input.locationFallback && input.countryCode) {
      return {
        locale: resolveFromCountry(input.countryCode, input.availableLocales, input.primaryLocale),
        via: 'location',
      };
    }
    return { locale: input.primaryLocale, via: 'default' };
  }

  var api = {
    normalizeLanguageTag: normalizeLanguageTag,
    resolveFromBrowser: resolveFromBrowser,
    resolveFromCountry: resolveFromCountry,
    resolveTargetLocale: resolveTargetLocale,
    COUNTRY_LANGUAGE_FALLBACK: COUNTRY_LANGUAGE_FALLBACK,
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

    var notice = document.getElementById('LocalizationNotice');

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
        if (notice) notice.hidden = true;
      },
      true
    );

    var preference = readPreference();

    if (preference) {
      // Automatic choice already made earlier: only surface the one-time notice.
      if (
        preference.source === 'auto' &&
        preference.noticePending &&
        preference.locale === config.currentLocale &&
        config.showNotice &&
        notice
      ) {
        showNotice(notice, preference);
      }
      return;
    }

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

    if (!config.locationFallback) {
      applyDecision(config.primaryLocale, 'default');
      return;
    }

    // Cautious location fallback via Shopify's own endpoint — no external service.
    window
      .fetch(config.rootUrl + 'browsing_context_suggestions.json', {
        headers: { Accept: 'application/json' },
      })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (json) {
        applyDecision(
          resolveFromCountry(extractCountryCode(json), config.availableLocales, config.primaryLocale),
          'location'
        );
      })
      .catch(function () {
        applyDecision(config.primaryLocale, 'default');
      });

    function applyDecision(targetLocale, via) {
      if (targetLocale === config.currentLocale) {
        // Best match is already showing: remember it, never redirect or repeat.
        writePreference({ locale: targetLocale, source: 'auto', via: via });
        return;
      }
      // Location is only an indication, never certainty: recommend instead of
      // redirecting. Only a clear browser-language match switches directly.
      if (via === 'location') {
        showSuggestion(targetLocale);
        return;
      }
      switchLocale(targetLocale, via);
    }

    function switchLocale(targetLocale, via) {
      // Store first so the localized page never re-triggers detection (no loops).
      if (!writePreference({ locale: targetLocale, source: 'auto', via: via, noticePending: true })) return;
      var form = document.getElementById('LocalizationDiscoveryForm');
      if (!form) return;
      var localeInput = form.querySelector('input[name="locale_code"]');
      if (!localeInput) return;
      localeInput.value = targetLocale;
      var returnToInput = form.querySelector('input[name="return_to"]');
      if (returnToInput) returnToInput.value = safeReturnTo();
      form.submit();
    }

    function showSuggestion(targetLocale) {
      var banner = document.getElementById('LocalizationSuggestion');
      if (!banner) {
        writePreference({ locale: config.currentLocale, source: 'auto', via: 'location-no-banner' });
        return;
      }
      var names = {};
      try {
        names = JSON.parse(banner.dataset.languageNames || '{}');
      } catch (error) {
        names = {};
      }
      var prompt = banner.querySelector('[data-suggestion-prompt]');
      if (prompt) {
        prompt.textContent = prompt.textContent.replace('[language]', names[targetLocale] || targetLocale);
      }
      banner.hidden = false;

      var accept = banner.querySelector('[data-suggestion-accept]');
      if (accept) {
        accept.addEventListener('click', function () {
          banner.hidden = true;
          switchLocale(targetLocale, 'location');
        });
      }
      var dismiss = banner.querySelector('[data-suggestion-dismiss]');
      if (dismiss) {
        dismiss.addEventListener('click', function () {
          banner.hidden = true;
          writePreference({ locale: config.currentLocale, source: 'auto', via: 'location-dismissed' });
        });
      }
    }
  }

  function extractCountryCode(json) {
    if (!json || typeof json !== 'object') return null;
    var detected = json.detected_values || {};
    if (detected.country && detected.country.handle) return detected.country.handle;
    if (typeof detected.country === 'string') return detected.country;
    if (detected.country_code) return detected.country_code;
    return null;
  }

  function showNotice(notice, preference) {
    notice.hidden = false;
    preference.noticePending = false;
    writePreference(preference);

    var dismissButton = notice.querySelector('[data-notice-dismiss]');
    if (dismissButton) {
      dismissButton.addEventListener('click', function () {
        notice.hidden = true;
      });
    }

    var changeButton = notice.querySelector('[data-notice-change]');
    if (changeButton) {
      changeButton.addEventListener('click', function () {
        notice.hidden = true;
        var selectors = document.querySelectorAll('localization-form');
        for (var i = 0; i < selectors.length; i++) {
          var hasLanguage = selectors[i].querySelector('input[name="locale_code"]');
          var button = selectors[i].querySelector('button.localization-form__select');
          if (hasLanguage && button && button.offsetParent !== null) {
            button.focus();
            button.click();
            return;
          }
        }
        // Fallback: bring any language selector (e.g. in the footer) into view.
        for (var j = 0; j < selectors.length; j++) {
          if (selectors[j].querySelector('input[name="locale_code"]')) {
            selectors[j].scrollIntoView();
            var fallbackButton = selectors[j].querySelector('button.localization-form__select');
            if (fallbackButton) fallbackButton.focus();
            return;
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
