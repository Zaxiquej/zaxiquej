(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DeckTapGuard = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function install(root, scrollHost, options = {}) {
    const events = options.events || root.ownerDocument.defaultView;
    const now = options.now || (() => performance.now());
    let gesture = null, lastScroll = -Infinity;
    const buttonFor = event => {
      const button = event.target.closest?.('button');
      return button && root.contains(button) ? button : null;
    };
    root.addEventListener('pointerdown', event => {
      if (event.isPrimary === false) { if (gesture) gesture.cancelled = true; return; }
      const button = buttonFor(event);
      gesture = button ? { button, id: event.pointerId, x: event.clientX, y: event.clientY,
        top: scrollHost.scrollTop, started: now(), cancelled: event.button !== 0 || now() - lastScroll < 120, released: false, used: false } : null;
    }, { passive: true, capture: true });
    const track = event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 12 || Math.abs(scrollHost.scrollTop - gesture.top) > 2) gesture.cancelled = true;
    };
    events.addEventListener('pointermove', track, { passive: true, capture: true });
    events.addEventListener('pointerup', event => {
      track(event);
      if (gesture?.id === event.pointerId) {
        gesture.released = true;
        if (now() - gesture.started > 700) gesture.cancelled = true;
      }
    }, { passive: true, capture: true });
    events.addEventListener('pointercancel', event => {
      if (gesture?.id === event.pointerId) gesture.cancelled = true;
    }, { passive: true, capture: true });
    scrollHost.addEventListener('scroll', () => {
      lastScroll = now();
      if (gesture && Math.abs(scrollHost.scrollTop - gesture.top) > 2) gesture.cancelled = true;
    }, { passive: true });
    root.addEventListener('click', event => {
      const button = buttonFor(event);
      // Keyboard and accessibility activation have no pointer gesture.
      if (!button || (event.detail === 0 && !event.pointerType)) return;
      const valid = gesture && gesture.button === button && gesture.released && !gesture.cancelled && !gesture.used
        && now() - gesture.started <= 1000 && Math.abs(scrollHost.scrollTop - gesture.top) <= 2;
      if (gesture) gesture.used = true;
      if (!valid) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  }
  return { install };
});
