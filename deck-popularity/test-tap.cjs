const assert = require('node:assert/strict');
const { install } = require('./tap-guard.js');
class Target {
  listeners = new Map();
  scrollTop = 0;
  addEventListener(type, listener) { const list = this.listeners.get(type) || []; list.push(listener); this.listeners.set(type, list); }
  emit(type, values = {}) {
    const event = { button: 0, isPrimary: true, pointerId: 1, clientX: 40, clientY: 40, detail: 1, pointerType: 'touch', prevented: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; }, ...values };
    for (const listener of this.listeners.get(type) || []) { listener(event); if (event.stopped) break; }
    return event;
  }
}
function fixture() {
  const root = new Target(), events = new Target(), scroll = new Target();
  const button = { closest() { return this; } };
  root.contains = value => value === button;
  let time = 1000, activations = 0;
  install(root, scroll, { events, now: () => time });
  root.addEventListener('click', () => activations++);
  return { root, events, scroll, button, advance: ms => time += ms, get activations() { return activations; },
    down: values => root.emit('pointerdown', { target: button, ...values }),
    up: values => events.emit('pointerup', { target: button, ...values }),
    click: values => root.emit('click', { target: button, ...values }) };
}
let f = fixture();
f.down(); f.advance(100); f.events.emit('pointermove', {clientX:44}); f.up({clientX:44}); f.click();
assert.equal(f.activations, 1, 'A normal tap with small finger jitter submits once');
f.click(); assert.equal(f.activations, 1, 'A duplicate click from the same gesture is blocked');
f = fixture(); f.down(); f.events.emit('pointermove', {clientY:90}); f.events.emit('pointermove', {clientY:40}); f.up(); f.click();
assert.equal(f.activations, 0, 'Dragging out and returning to the button is not a tap');
f = fixture(); f.down(); f.scroll.scrollTop=20; f.scroll.emit('scroll'); f.up(); f.click();
assert.equal(f.activations, 0, 'Scrolling from a button must not submit');
f.down(); f.up(); f.click(); assert.equal(f.activations, 0, 'Stopping inertial scrolling does not activate a button');
f.advance(150); f.down(); f.up(); f.click(); assert.equal(f.activations, 1, 'A fresh tap after scrolling works');
f = fixture(); f.down(); f.events.emit('pointercancel'); f.up(); f.click();
assert.equal(f.activations, 0, 'Cancelled gestures cannot submit');
f = fixture(); f.down(); f.root.emit('pointerdown', {target:f.button,pointerId:2,isPrimary:false}); f.up(); f.click();
assert.equal(f.activations, 0, 'Multi-touch cannot submit');
f = fixture(); f.down(); f.advance(800); f.up(); f.click();
assert.equal(f.activations, 0, 'Long press cannot submit');
f.click({detail:0,pointerType:''}); assert.equal(f.activations, 1, 'Keyboard/accessibility activation still works');
f = fixture(); f.down({pointerType:'mouse'}); f.advance(80); f.up({pointerType:'mouse'}); f.click({pointerType:'mouse'});
assert.equal(f.activations, 1, 'Desktop clicking remains immediate');
console.log('PASS: direct taps, jitter, drag-return, scrolling, inertia, cancellation, multi-touch, long press, duplicate clicks and keyboard/mouse activation.');
