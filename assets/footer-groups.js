/*
 * Footer link groups are rendered as native <details open> so they remain
 * fully readable without JavaScript. On small screens they are collapsed to
 * keep the footer short; on wider screens they are forced open because the
 * desktop layout renders them as static columns.
 */
(function () {
  const container = document.querySelector('[data-footer-groups]');
  if (!container) return;

  const groups = container.querySelectorAll('details.footer__group');
  if (!groups.length) return;

  const wide = window.matchMedia('(min-width: 750px)');

  function sync(event) {
    groups.forEach((group) => {
      group.open = event.matches;
    });
  }

  sync(wide);
  wide.addEventListener('change', sync);
})();
