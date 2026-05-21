import { isFunction } from './utils.js';

export function propagateEvent(eventTarget, event) {
  // call attribute first if exists
  if (isFunction(eventTarget[`on${event.type}`])) {
    eventTarget[`on${event.type}`](event);
  }
  // then dispatch to `addEventListener` callbacks
  eventTarget.dispatchEvent(event);
}
