if (!customElements.get('sticky-buy-bar')) {
  customElements.define(
    'sticky-buy-bar',
    class StickyBuyBar extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.section;
        this.priceEl = this.querySelector('[data-sticky-price]');
        this.labelEl = this.querySelector('[data-sticky-label]');
        this.submitButton = this.querySelector('[data-sticky-submit]');

        const mainButton = this.getMainButton();
        if (!mainButton || !this.submitButton) return;

        // Delegate to the real submit button so the add-to-cart pipeline
        // (and any analytics attached to it) runs exactly once.
        this.submitButton.addEventListener('click', () => {
          const button = this.getMainButton();
          if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
          button.click();
        });

        this.intersectionObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          this.classList.toggle('sticky-buy--visible', scrolledPast);
        });
        this.observedAnchor = null;
        this.observeAnchor();

        const infoContainer = document.getElementById(`ProductInfo-${this.sectionId}`);
        if (infoContainer) {
          this.mutationObserver = new MutationObserver(() => this.requestSync());
          this.mutationObserver.observe(infoContainer, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['disabled', 'aria-disabled'],
          });
        }

        this.sync();
      }

      disconnectedCallback() {
        if (this.intersectionObserver) this.intersectionObserver.disconnect();
        if (this.mutationObserver) this.mutationObserver.disconnect();
      }

      getMainButton() {
        return document.getElementById(`ProductSubmitButton-${this.sectionId}`);
      }

      observeAnchor() {
        const button = this.getMainButton();
        if (!button) return;
        const anchor = button.closest('.product-form__buttons') || button;
        if (anchor === this.observedAnchor) return;
        if (this.observedAnchor) this.intersectionObserver.unobserve(this.observedAnchor);
        this.intersectionObserver.observe(anchor);
        this.observedAnchor = anchor;
      }

      requestSync() {
        if (this.syncScheduled) return;
        this.syncScheduled = true;
        requestAnimationFrame(() => {
          this.syncScheduled = false;
          this.sync();
        });
      }

      sync() {
        const button = this.getMainButton();
        if (!button) return;
        this.observeAnchor();

        const disabled = button.disabled || button.getAttribute('aria-disabled') === 'true';
        this.submitButton.toggleAttribute('disabled', disabled);

        const label = button.querySelector('span');
        if (label && this.labelEl) this.labelEl.textContent = label.textContent.trim();

        const price = document.getElementById(`price-${this.sectionId}`);
        if (price && this.priceEl) {
          const priceItem =
            price.querySelector('.price-item--sale.price-item--last') || price.querySelector('.price-item--regular');
          if (priceItem) this.priceEl.textContent = priceItem.textContent.trim();
        }
      }
    }
  );
}
