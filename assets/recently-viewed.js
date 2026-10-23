/*
  Privacy-friendly "Recently viewed" (browser-local, no tracking, no external
  requests). Storage: localStorage key 'recently-viewed-items' — [handle,...],
  newest first, max 8 stored, max 3 shown (one desktop row of three, like
  the other product rows). Once the page has loaded (idle time)
  each card is fetched from the shop itself through the Section Rendering API
  (/products/<handle>?section_id=recently-viewed-card), so the cards are the
  theme's own product cards. See docs/wishlist-and-recently-viewed.md.
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'recently-viewed-items';
  var MAX_STORED = 8;
  var MAX_SHOWN = 3;

  function readHandles() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  // routes.root_url is '/' for the default language but '/nl' (no trailing
  // slash) for the others.
  function cardUrl(rootUrl, handle) {
    var root = rootUrl || '/';
    if (root.charAt(root.length - 1) !== '/') root += '/';
    return root + 'products/' + encodeURIComponent(handle) + '?section_id=recently-viewed-card';
  }

  // The response is the section wrapper with one rendered product card inside.
  function cardHtml(text) {
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var section = doc.querySelector('.shopify-section');
    var html = section ? section.innerHTML.trim() : '';
    return html.indexOf('card') === -1 ? null : html;
  }

  function recordVisit(handle) {
    try {
      var handles = readHandles().filter(function (item) {
        return item !== handle;
      });
      handles.unshift(handle);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(handles.slice(0, MAX_STORED)));
    } catch (error) {
      /* no storage: feature silently unavailable */
    }
  }

  if (!customElements.get('recently-viewed')) {
    customElements.define(
      'recently-viewed',
      class RecentlyViewed extends HTMLElement {
        connectedCallback() {
          var current = this.dataset.currentHandle || '';
          if (current) recordVisit(current);

          this.handles = readHandles()
            .filter(function (handle) {
              return handle !== current;
            })
            .slice(0, MAX_SHOWN);

          // Hide on the first product visit or with insufficient data.
          if (this.handles.length === 0) {
            this.remove();
            return;
          }

          // The element stays hidden until it has cards, so it cannot be
          // observed for intersection. Load once the page itself has finished
          // loading, in idle time: the section sits above the footer, so it
          // is almost always unhidden off-screen.
          var element = this;
          var start = function () {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(
                function () {
                  element.load();
                },
                { timeout: 2000 }
              );
            } else {
              window.setTimeout(function () {
                element.load();
              }, 1500);
            }
          };
          if (document.readyState === 'complete') {
            start();
          } else {
            window.addEventListener('load', start, { once: true });
          }
        }

        load() {
          if (this.loadStarted || !this.isConnected) return;
          this.loadStarted = true;
          var element = this;
          Promise.all(
            this.handles.map(function (handle) {
              return window
                .fetch(cardUrl(element.dataset.rootUrl, handle))
                .then(function (response) {
                  return response.ok ? response.text() : null;
                })
                .then(function (text) {
                  return text ? cardHtml(text) : null;
                })
                .catch(function () {
                  return null;
                });
            })
          ).then(function (cards) {
            var available = cards.filter(Boolean);
            if (available.length === 0) {
              element.remove();
              return;
            }
            element.renderCards(available);
          });
        }

        renderCards(cards) {
          var grid = this.querySelector('[data-recently-viewed-grid]');
          if (!grid) return;
          var sectionId = this.dataset.sectionId || 'recently-viewed';
          // Below 990px the grid shows two cards per row; with more cards it
          // becomes Dawn's swipeable slider, like "You may also like".
          var useSlider = cards.length > 2;
          cards.forEach(function (html, index) {
            var item = document.createElement('li');
            item.id = 'Slide-' + sectionId + '-' + (index + 1);
            item.className = useSlider ? 'grid__item slider__slide' : 'grid__item';
            item.innerHTML = html;
            grid.appendChild(item);
          });
          var slider = this.querySelector('slider-component');
          var buttons = this.querySelector('.slider-buttons');
          if (useSlider) {
            grid.classList.add('slider', 'slider--tablet', 'grid--peek');
            if (slider) slider.classList.remove('page-width');
          } else if (buttons) {
            buttons.remove();
          }
          this.hidden = false;
          if (useSlider && slider && typeof slider.resetPages === 'function') slider.resetPages();
        }
      }
    );
  }
})();
