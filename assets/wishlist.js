/*
  Browser-local wishlist (progressive enhancement, no account, no tracking).
  Storage: localStorage key 'wishlist-items' — [{handle, id, title, url}].
  The wishlist page fetches each saved piece's card through the Section
  Rendering API (/products/<handle>?section_id=recently-viewed-card), like
  Recently viewed. This first version is browser-bound and does not sync
  between devices; see docs/wishlist-and-recently-viewed.md.
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
  function cardUrl(rootUrl, handle) {
    var root = rootUrl || '/';
    if (root.charAt(root.length - 1) !== '/') root += '/';
    return root + 'products/' + encodeURIComponent(handle) + '?section_id=recently-viewed-card';
  }

  // The response is the section wrapper with one rendered product card inside
  // (the fragment Recently viewed uses too); null when the product is gone.
  // Recently viewed can show the same piece on this page, so the card's ids
  // (and the aria-labelledby references to them) get a prefix.
  function parseCard(text) {
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var section = doc.querySelector('.shopify-section');
    if (!section || !section.querySelector('.card-wrapper')) return null;
    var ids = {};
    section.querySelectorAll('[id]').forEach(function (node) {
      ids[node.id] = true;
      node.id = 'Wishlist-' + node.id;
    });
    section.querySelectorAll('[aria-labelledby]').forEach(function (node) {
      var refs = node.getAttribute('aria-labelledby').split(/\s+/).map(function (id) {
        return ids[id] ? 'Wishlist-' + id : id;
      });
      node.setAttribute('aria-labelledby', refs.join(' '));
    });
    var heading = section.querySelector('.card__heading a');
    return { html: section.innerHTML.trim(), title: heading ? heading.textContent.trim() : '' };
  }

  // First visible link in a card (its title), else its first visible button.
  function focusTargetIn(card) {
    var controls = card.querySelectorAll('a[href], button');
    var fallback = null;
    for (var i = 0; i < controls.length; i++) {
      if (!controls[i].getClientRects().length) continue;
      if (controls[i].tagName === 'A') return controls[i];
      if (!fallback) fallback = controls[i];
    }
    return fallback;
  }

  if (!customElements.get('wishlist-items')) {
    customElements.define(
      'wishlist-items',
      class WishlistItems extends HTMLElement {
        connectedCallback() {
          this.grid = this.querySelector('[data-wishlist-grid]');
          this.emptyState = this.querySelector('[data-wishlist-empty]');
          this.template = this.querySelector('template');
          if (!this.initialised) {
            this.initialised = true;
            this.refresh = this.refresh.bind(this);
            // Capture phase: runs before the card's own heart button handles the
            // click, so refresh() knows which card the visitor acted in.
            this.addEventListener('click', this.onClick.bind(this), true);
          }
          document.addEventListener('wishlist:change', this.refresh);
          window.addEventListener('storage', this.refresh);
          this.refresh();
        }

        disconnectedCallback() {
          document.removeEventListener('wishlist:change', this.refresh);
          window.removeEventListener('storage', this.refresh);
        }

        cards() {
          return this.grid ? Array.prototype.slice.call(this.grid.querySelectorAll('[data-wishlist-card]')) : [];
        }

        onClick(event) {
          var card = event.target.closest('[data-wishlist-card]');
          if (!card || !event.target.closest('[data-wishlist-remove], wishlist-button')) return;
          this.actionCard = card;
          if (!event.target.closest('[data-wishlist-remove]')) return;
          var handle = card.dataset.handle;
          writeItems(
            readItems().filter(function (item) {
              return item.handle !== handle;
            })
          );
        }

        refresh(event) {
          var items = readItems().slice(0, 50);
          if (this.emptyState) this.emptyState.hidden = items.length > 0;
          if (this.grid) this.grid.hidden = items.length === 0;
          if (!this.grid || !this.template) return;
          var element = this;
          var handles = items.map(function (item) {
            return item.handle;
          });
          var removed = this.cards().filter(function (card) {
            return handles.indexOf(card.dataset.handle) === -1;
          });
          if (removed.length) this.removeCards(removed, !event || event.type !== 'storage');
          this.actionCard = null;
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

        // Removing a piece only drops its card, so the scroll position stays put.
        // When the visitor removed it here (Remove or the card's heart), or focus
        // was inside it, focus moves to the next piece, or to the empty-state
        // heading when none are left.
        removeCards(removed, announce) {
          var active = document.activeElement;
          var source = removed.filter(function (card) {
            return card === this.actionCard || card.contains(active);
          }, this)[0];
          var focusTarget = null;
          if (source) {
            var next = source.nextElementSibling;
            while (next && removed.indexOf(next) !== -1) next = next.nextElementSibling;
            var previous = source.previousElementSibling;
            while (previous && removed.indexOf(previous) !== -1) previous = previous.previousElementSibling;
            var sibling = next || previous;
            focusTarget = sibling ? focusTargetIn(sibling) : this.querySelector('[data-wishlist-empty-heading]');
          }
          var titles = removed.map(function (card) {
            card.remove();
            return card.dataset.title;
          });
          var status = this.querySelector('[data-wishlist-status]');
          if (announce && status && this.dataset.removedNotice) {
            status.textContent = this.dataset.removedNotice.replace('[title]', titles.join(', '));
          }
          if (focusTarget) focusTarget.focus();
        }

        // Keep in step with the inline script in sections/wishlist-items.liquid.
        buildCard(saved) {
          var card = this.template.content.querySelector('[data-wishlist-card]').cloneNode(true);
          var link = card.querySelector('[data-wishlist-link]');
          card.dataset.handle = saved.handle;
          card.dataset.title = saved.title || saved.handle;
          link.textContent = card.dataset.title;
          if (saved.url) link.setAttribute('href', saved.url);
          return card;
        }

        loadCard(card) {
          if (card.dataset.loaded) return;
          card.dataset.loaded = 'true';
          this.labelRemove(card);
          var element = this;
          window
            .fetch(cardUrl(this.dataset.rootUrl, card.dataset.handle))
            .then(function (response) {
              return response.ok ? response.text() : null;
            })
            .then(function (text) {
              return text ? parseCard(text) : null;
            })
            .catch(function () {
              return null;
            })
            .then(function (product) {
              element.fillCard(card, product);
            });
        }

        labelRemove(card) {
          var remove = card.querySelector('[data-wishlist-remove]');
          if (remove && this.dataset.removeLabel) remove.setAttribute('aria-label', this.dataset.removeLabel + ': ' + card.dataset.title);
        }

        // Swaps the placeholder for the fetched card; the Remove button stays below it.
        fillCard(card, product) {
          var placeholder = card.querySelector('[data-wishlist-placeholder]');
          if (!placeholder || !card.isConnected) return;

          if (product) {
            var hadFocus = placeholder.contains(document.activeElement);
            if (product.title) card.dataset.title = product.title;
            placeholder.insertAdjacentHTML('beforebegin', product.html);
            placeholder.remove();
            this.labelRemove(card);
            if (hadFocus) {
              var target = focusTargetIn(card);
              if (target) target.focus();
            }
            return;
          }

          card.classList.add('wishlist-card--unavailable');
          placeholder.querySelector('[data-wishlist-link]').removeAttribute('href');
          placeholder.querySelectorAll('[data-wishlist-pending]').forEach(function (line) {
            line.remove();
          });
          var unavailable = placeholder.querySelector('[data-wishlist-unavailable]');
          if (unavailable) unavailable.hidden = false;
        }
      }
    );
  }
})();
