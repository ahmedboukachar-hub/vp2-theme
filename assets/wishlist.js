/*
  Browser-local wishlist (progressive enhancement, no account, no tracking).
  Storage: localStorage key 'wishlist-items' — [{handle, id, title, url}].
  This first version is browser-bound and does not sync between devices;
  see docs/wishlist-and-recently-viewed.md.
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'wishlist-items';

  function readItems() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeItems(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      /* storage unavailable: buttons still toggle for this page view only */
    }
    document.dispatchEvent(new CustomEvent('wishlist:change'));
  }

  function hasItem(handle) {
    return readItems().some(function (item) {
      return item.handle === handle;
    });
  }

  if (!customElements.get('wishlist-button')) {
    customElements.define(
      'wishlist-button',
      class WishlistButton extends HTMLElement {
        connectedCallback() {
          this.button = this.querySelector('button');
          if (!this.button) return;
          this.button.addEventListener('click', this.toggle.bind(this));
          this.render = this.render.bind(this);
          document.addEventListener('wishlist:change', this.render);
          window.addEventListener('storage', this.render);
          this.render();
        }

        disconnectedCallback() {
          document.removeEventListener('wishlist:change', this.render);
          window.removeEventListener('storage', this.render);
        }

        toggle() {
          var handle = this.dataset.productHandle;
          var items = readItems();
          if (hasItem(handle)) {
            items = items.filter(function (item) {
              return item.handle !== handle;
            });
          } else {
            items.push({
              handle: handle,
              id: this.dataset.productId,
              title: this.dataset.productTitle,
              url: this.dataset.productUrl,
            });
          }
          writeItems(items);
        }

        render() {
          var saved = hasItem(this.dataset.productHandle);
          var label = saved ? this.button.dataset.labelRemove : this.button.dataset.labelAdd;
          this.button.setAttribute('aria-pressed', saved ? 'true' : 'false');
          this.button.setAttribute('aria-label', label);
          this.classList.toggle('wishlist-button--saved', saved);
        }
      }
    );
  }

  // routes.root_url is '/' for the default language but '/nl' (no trailing
  // slash) for the others.
  function productUrl(rootUrl, handle) {
    var root = rootUrl || '/';
    if (root.charAt(root.length - 1) !== '/') root += '/';
    return root + 'products/' + encodeURIComponent(handle) + '.js';
  }

  function formatMoney(cents, format) {
    var amount = (cents / 100).toFixed(2);
    var parts = amount.split('.');
    var thousands = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var value = thousands + '.' + parts[1];
    if (/amount_with_comma_separator/.test(format)) {
      value = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
    }
    return (format || '{{amount}}').replace(/\{\{\s*amount[a-z_]*\s*\}\}/, value);
  }

  if (!customElements.get('wishlist-items')) {
    customElements.define(
      'wishlist-items',
      class WishlistItems extends HTMLElement {
        connectedCallback() {
          this.grid = this.querySelector('[data-wishlist-grid]');
          this.emptyState = this.querySelector('[data-wishlist-empty]');
          this.template = this.querySelector('template');
          this.refresh = this.refresh.bind(this);
          document.addEventListener('wishlist:change', this.refresh);
          window.addEventListener('storage', this.refresh);
          this.refresh();
        }

        cards() {
          return this.grid ? Array.prototype.slice.call(this.grid.querySelectorAll('[data-wishlist-card]')) : [];
        }

        refresh() {
          var items = readItems().slice(0, 50);
          if (this.emptyState) this.emptyState.hidden = items.length > 0;
          if (this.grid) this.grid.hidden = items.length === 0;
          if (!this.grid || !this.template) return;
          var element = this;
          var handles = items.map(function (item) {
            return item.handle;
          });
          // Removing a piece only drops its card, so focus and scroll position stay put.
          this.cards().forEach(function (card) {
            if (handles.indexOf(card.dataset.handle) === -1) card.remove();
          });
          var rendered = this.cards().map(function (card) {
            return card.dataset.handle;
          });
          // New pieces get a placeholder card right away (the section's inline
          // script does the same before first paint), filled in place below.
          items.forEach(function (item) {
            if (rendered.indexOf(item.handle) === -1) element.grid.appendChild(element.buildCard(item));
          });
          this.cards().forEach(function (card) {
            element.loadCard(card);
          });
        }

        // Keep in step with the inline script in sections/wishlist-items.liquid.
        buildCard(saved) {
          var card = this.template.content.querySelector('[data-wishlist-card]').cloneNode(true);
          card.dataset.handle = saved.handle;
          card.querySelector('[data-wishlist-title]').textContent = saved.title || saved.handle;
          if (saved.url) card.querySelector('[data-wishlist-link]').setAttribute('href', saved.url);
          return card;
        }

        loadCard(card) {
          if (card.dataset.loaded) return;
          card.dataset.loaded = 'true';
          var element = this;
          var handle = card.dataset.handle;
          var title = card.querySelector('[data-wishlist-title]');
          var remove = card.querySelector('[data-wishlist-remove]');
          this.labelRemove(remove, title.textContent);

          remove.addEventListener('click', function () {
            var next = card.nextElementSibling || card.previousElementSibling;
            var focusTarget = next ? next.querySelector('a[href], button') : element.querySelector('[data-wishlist-empty-heading]');
            writeItems(
              readItems().filter(function (item) {
                return item.handle !== handle;
              })
            );
            var status = element.querySelector('[data-wishlist-status]');
            if (status && element.dataset.removedNotice) status.textContent = element.dataset.removedNotice.replace('[title]', title.textContent);
            if (focusTarget) focusTarget.focus();
          });

          window
            .fetch(productUrl(this.dataset.rootUrl, handle), {
              headers: { Accept: 'application/json' },
            })
            .then(function (response) {
              return response.ok ? response.json() : null;
            })
            .catch(function () {
              return null;
            })
            .then(function (product) {
              element.fillCard(card, product);
            });
        }

        labelRemove(remove, titleText) {
          if (this.dataset.removeLabel) remove.setAttribute('aria-label', this.dataset.removeLabel + ': ' + titleText);
        }

        fillCard(card, product) {
          var link = card.querySelector('[data-wishlist-link]');
          var title = card.querySelector('[data-wishlist-title]');
          var price = card.querySelector('[data-wishlist-price]');
          var image = card.querySelector('[data-wishlist-image]');
          var unavailable = card.querySelector('[data-wishlist-unavailable]');

          if (product) {
            title.textContent = product.title;
            this.labelRemove(card.querySelector('[data-wishlist-remove]'), product.title);
            link.href = product.url;
            if (price) price.textContent = formatMoney(product.price, this.dataset.moneyFormat);
            if (image) {
              if (product.featured_image) {
                var src = product.featured_image;
                image.src = src + (src.indexOf('?') === -1 ? '?width=600' : '&width=600');
                image.alt = '';
              } else {
                image.remove();
              }
            }
            if (unavailable) unavailable.remove();
          } else {
            link.removeAttribute('href');
            if (price) price.remove();
            if (image) image.remove();
            if (unavailable) unavailable.hidden = false;
            card.classList.add('wishlist-card--unavailable');
          }
        }
      }
    );
  }
})();
