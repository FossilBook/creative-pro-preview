'use strict';
(() => {
  // VisualViewport follows the space above the iOS/Android keyboard.
  const viewport = window.visualViewport;
  let frame;
  function syncViewport() {
    if (viewport && Math.abs(viewport.scale - 1) > .05) return;
    document.documentElement.style.setProperty('--visual-height', `${viewport?.height || window.innerHeight}px`);
    document.documentElement.style.setProperty('--visual-top', `${viewport?.offsetTop || 0}px`);
    requestAnimationFrame(() => {
      const field = document.activeElement;
      const dialog = field?.closest('dialog[open]');
      if (!dialog || !field.matches('input:not([type="radio"]),textarea,select') || window.innerWidth > 950) return;
      const bounds = field.getBoundingClientRect();
      const panel = dialog.getBoundingClientRect();
      if (bounds.bottom > panel.bottom - 24 || bounds.top < panel.top + 70) {
        field.scrollIntoView({block:'nearest',behavior:'instant'});
      }
    });
  }
  function queueViewport() { cancelAnimationFrame(frame); frame = requestAnimationFrame(syncViewport); }
  function onViewportScroll(){if(document.querySelector('dialog[open]'))queueViewport();}
  viewport?.addEventListener('resize', queueViewport, {passive:true});
  viewport?.addEventListener('scroll', onViewportScroll, {passive:true});
  window.addEventListener('resize', queueViewport, {passive:true});
  syncViewport();
  document.addEventListener('click', event => {
    const nav = document.querySelector('#main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav?.classList.contains('open')) return;
    if (!event.target.closest('.header') || event.target.closest('[data-plan]')) {
      nav.classList.remove('open'); toggle?.setAttribute('aria-expanded','false');
    }
  });
})();
