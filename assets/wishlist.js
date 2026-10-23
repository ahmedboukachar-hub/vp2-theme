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

        refresh() {
          var items = readItems();
          if (this.emptyState) this.emptyState.hidden = items.length > 0;
          if (this.grid) this.grid.hidden = items.length === 0;
          if (items.length === 0) {
            if (this.grid) this.grid.innerHTML = '';
            return;
          }
          // Removing a piece only drops its card, so focus and scroll position stay put.
          if (this.grid && this.grid.children.length) {
            var handles = items.map(function (item) {
              return item.handle;
            });
            Array.prototype.slice.call(this.grid.querySelectorAll('[data-wishlist-card]')).forEach(function (card) {
              if (handles.indexOf(card.dataset.handle) === -1) card.remove();
            });
            var rendered = Array.prototype.slice.call(this.grid.querySelectorAll('[data-wishlist-card]')).map(function (card) {
              return card.dataset.handle;
            });
            var missing = items.some(function (item) {
              return rendered.indexOf(item.handle) === -1;
            });
            if (!missing) return;
          }
          this.renderItems(items.slice(0, 50));
        }

        renderItems(items) {
          var element = this;
          Promise.all(
            items.map(function (item) {
              return window
                .fetch(element.dataset.rootUrl + 'products/' + item.handle + '.js', {
                  headers: { Accept: 'application/json' },
                })
                .then(function (response) {
                  return response.ok ? response.json() : null;
                })
                .catch(function () {
                  return null;
                })
                .then(function (product) {
                  return { saved: item, product: product };
                });
            })
          ).then(function (results) {
            element.grid.innerHTML = '';
            results.forEach(function (result) {
              element.grid.appendChild(element.buildCard(result.saved, result.product));
            });
          });
        }

        buildCard(saved, product) {
          var fragment = this.template.content.cloneNode(true);
          var card = fragment.querySelector('[data-wishlist-card]');
          var link = fragment.querySelector('[data-wishlist-link]');
          var title = fragment.querySelector('[data-wishlist-title]');
          var price = fragment.querySelector('[data-wishlist-price]');
          var image = fragment.querySelector('[data-wishlist-image]');
          var unavailable = fragment.querySelector('[data-wishlist-unavailable]');
          var remove = fragment.querySelector('[data-wishlist-remove]');

          var element = this;
          var titleText = product ? product.title : saved.title || saved.handle;
          card.dataset.handle = saved.handle;
          title.textContent = titleText;
          if (this.dataset.removeLabel) remove.setAttribute('aria-label', this.dataset.removeLabel + ': ' + titleText);
          if (product) {
            link.href = product.url;
            price.textContent = formatMoney(product.price, this.dataset.moneyFormat);
            if (product.featured_image) {
              image.src = product.featured_image + '&width=600';
              if (product.featured_image.indexOf('?') === -1) {
                image.src = product.featured_image + '?width=600';
              }
              image.alt = '';
            } else {
              image.remove();
            }
            unavailable.remove();
          } else {
            link.removeAttribute('href');
            price.remove();
            image.remove();
            card.classList.add('wishlist-card--unavailable');
          }

          remove.addEventListener('click', function () {
            var currentCard = remove.closest('[data-wishlist-card]');
            var next = currentCard && (currentCard.nextElementSibling || currentCard.previousElementSibling);
            var focusTarget = next ? next.querySelector('a[href], button') : element.querySelector('[data-wishlist-empty-heading]');
            writeItems(
              readItems().filter(function (item) {
                return item.handle !== saved.handle;
              })
            );
            var status = element.querySelector('[data-wishlist-status]');
            if (status && element.dataset.removedNotice) status.textContent = element.dataset.removedNotice.replace('[title]', titleText);
            if (focusTarget) focusTarget.focus();
          });
          return fragment;
        }
      }
    );
  }
})();
