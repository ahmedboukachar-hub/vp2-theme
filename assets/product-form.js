if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      connectedCallback() {
        if (!this.dataset.inCartLabel) return;

        // One-off pieces: keep "In your cart" in step with removals made in
        // the cart drawer or on the cart page, and with pages restored from
        // the back-forward cache.
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
          if (!event || event.source === 'product-form') return;
          if (Array.isArray(event.cartData?.items)) {
            this.applyCartItems(event.cartData.items);
          } else {
            this.refreshInCart();
          }
        });
        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (event?.data?.sectionId !== this.dataset.sectionId) return;
          const form = event.data.html?.querySelector(`product-form[data-section-id="${this.dataset.sectionId}"]`);
          this.dataset.inventoryMax = form?.dataset.inventoryMax || '';
          this.setInCart(form?.dataset.inCart === 'true');
        });
        this.onPageShow = (event) => {
          if (event.persisted) this.refreshInCart();
        };
        window.addEventListener('pageshow', this.onPageShow);
      }

      disconnectedCallback() {
        this.cartUpdateUnsubscriber?.();
        this.variantChangeUnsubscriber?.();
        if (this.onPageShow) window.removeEventListener('pageshow', this.onPageShow);
      }

      get inventoryMax() {
        return parseInt(this.dataset.inventoryMax, 10) || 0;
      }

      get inCart() {
        return this.dataset.inCart === 'true';
      }

      setInCart(inCart) {
        if (!this.dataset.inCartLabel) return;
        this.dataset.inCart = inCart ? 'true' : 'false';
        // A sold-out or unavailable variant keeps its own disabled label.
        if (this.submitButton.hasAttribute('disabled')) return;
        this.submitButtonText.textContent = inCart ? this.dataset.inCartLabel : window.variantStrings.addToCart;
      }

      applyCartItems(items) {
        const variantId = String(this.variantIdInput.value);
        const quantity = items
          .filter((item) => String(item.variant_id ?? item.id) === variantId)
          .reduce((total, item) => total + item.quantity, 0);
        const inCart = this.inventoryMax > 0 && quantity >= this.inventoryMax;
        this.setInCart(inCart);
        return inCart;
      }

      refreshInCart() {
        if (!this.inventoryMax) return Promise.resolve(false);
        return fetch(`${routes.cart_url}.js`, { headers: { Accept: 'application/json' } })
          .then((response) => response.json())
          .then((cart) => (Array.isArray(cart?.items) ? this.applyCartItems(cart.items) : this.inCart))
          .catch(() => this.inCart);
      }

      openCart() {
        const cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function' && !this.closest('quick-add-modal')) {
          cartDrawer.open(this.submitButton);
          return;
        }
        window.location = window.routes.cart_url;
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        // The only unit is already in the cart: open the cart instead of
        // sending an add that the store would refuse.
        if (this.inCart && !this.submitButton.hasAttribute('disabled')) {
          this.openCart();
          return;
        }

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        const variantId = formData.get('id');
        const quantity = parseInt(formData.get('quantity')) || 1;
        const linesUpdateDeferred = this.createCartLinesUpdateEvent(variantId, quantity);

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: variantId,
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              this.dispatchCartErrorEvent(response.description || response.message, 'INVALID');
              linesUpdateDeferred?.reject(new Error(response.description || response.message));

              // The add was refused because the piece is already in the cart
              // (another tab, or a page restored from cache): show the cart
              // state instead of an error.
              if (this.inventoryMax) {
                this.refreshInCart().then((inCart) => {
                  if (inCart) this.handleErrorMessage();
                });
              }

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              this.resolveCartLinesUpdate(linesUpdateDeferred);
              window.location = window.routes.cart_url;
              return;
            }

            this.resolveCartLinesUpdate(linesUpdateDeferred);

            // The added line carries the variant's quantity now in the cart.
            if (this.inventoryMax && String(response.variant_id ?? variantId) === String(variantId)) {
              const quantityInCart = parseInt(response.quantity, 10) || quantity;
              if (this.inventoryMax === 1 || quantityInCart >= this.inventoryMax) this.setInCart(true);
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: variantId,
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
            this.dispatchCartErrorEvent(e.message || 'Network error', 'SERVICE_UNAVAILABLE');
            linesUpdateDeferred?.reject(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent =
            this.inCart && this.dataset.inCartLabel ? this.dataset.inCartLabel : window.variantStrings.addToCart;
        }
      }

      createCartLinesUpdateEvent(variantId, quantity) {
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return null;

        const deferred = CartLinesUpdateEvent.createPromise();
        this.dispatchEvent(
          new CartLinesUpdateEvent({
            action: 'add',
            context: 'product',
            lines: [{ merchandiseId: variantId, quantity }],
            promise: deferred.promise,
          })
        );
        return deferred;
      }

      resolveCartLinesUpdate(deferred) {
        if (!deferred) return;
        const { CartLinesUpdateEvent } = window.StandardEvents || {};
        if (!CartLinesUpdateEvent) return;

        const pendingCartDataPromise = typeof CartItems !== 'undefined'
          ? CartItems.fetchCartData()
          : fetch(`${routes.cart_url}.json`).then((response) => response.json());

        pendingCartDataPromise
          .then((cart) => {
            if (!cart?.currency) return deferred.reject(new Error('Missing currency in cart response'));
            deferred.resolve({ cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart) });
          })
          .catch((e) => deferred.reject(e));
      }

      dispatchCartErrorEvent(message, code) {
        const { CartErrorEvent } = window.StandardEvents || {};
        if (!CartErrorEvent) return;
        this.dispatchEvent(new CartErrorEvent({ error: message, code }));
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
