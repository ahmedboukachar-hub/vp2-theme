/*
  Privacy-friendly "Recently viewed" (browser-local, no tracking, no external
  requests). Storage: localStorage key 'recently-viewed-items' — [handle,...],
  newest first, max 8 stored, max 4 shown. Product data is fetched lazily via
  the shop's own /products/<handle>.js endpoints when the section nears the
  viewport. See docs/wishlist-and-recently-viewed.md.
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'recently-viewed-items';
  var MAX_STORED = 8;
  var MAX_SHOWN = 4;

  function readHandles() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
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

          if ('IntersectionObserver' in window) {
            var element = this;
            this.observer = new IntersectionObserver(
              function (entries) {
                if (entries[0].isIntersecting) {
                  element.observer.disconnect();
                  element.load();
                }
              },
              { rootMargin: '200px' }
            );
            this.observer.observe(this);
          } else {
            this.load();
          }
        }

        load() {
          var element = this;
          Promise.all(
            this.handles.map(function (handle) {
              return window
                .fetch(element.dataset.rootUrl + 'products/' + handle + '.js', {
                  headers: { Accept: 'application/json' },
                })
                .then(function (response) {
                  return response.ok ? response.json() : null;
                })
                .catch(function () {
                  return null;
                });
            })
          ).then(function (products) {
            var available = products.filter(function (product) {
              return product && product.url;
            });
            if (available.length === 0) {
              element.remove();
              return;
            }
            element.renderProducts(available);
          });
        }

        renderProducts(products) {
          var grid = this.querySelector('[data-recently-viewed-grid]');
          var template = this.querySelector('template');
          if (!grid || !template) return;
          var element = this;
          products.forEach(function (product) {
            var fragment = template.content.cloneNode(true);
            var link = fragment.querySelector('[data-rv-link]');
            var title = fragment.querySelector('[data-rv-title]');
            var image = fragment.querySelector('[data-rv-image]');
            link.href = product.url;
            title.textContent = product.title;
            if (product.featured_image) {
              var src = product.featured_image;
              image.src = src + (src.indexOf('?') === -1 ? '?width=600' : '&width=600');
              image.alt = product.title;
            } else {
              image.remove();
            }
            grid.appendChild(fragment);
          });
          element.hidden = false;
        }
      }
    );
  }
})();
