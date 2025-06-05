/**
 * Event communication handler between iframe and parent window.
 * Supports:
 * - Dispatching events to self, iframe, and/or parent.
 * - Listening to events on the current window.
 *
 * Usage:
 *
 * ```js
 * const triggers = ['ready', 'parentReady'];
 *
 * const events = new Events()
 *   .resolveIframeVia(() => store().iframe)
 *   .triggers(triggers)
 *   .init();
 *
 * events.ready.dispatch();
 * events.ready.listen(data => console.log(data));
 * ```
 */

import { isIframe } from './dom';
import { str } from './strings';

export class Events {
  constructor() {
    this._iframeElement = null;
    this.iframeResolver = null;
    this.triggersList = [];
    this.eventNames = {};
    this.generated = {};
  }

  /**
   * Define a resolver to lazily get the iframe element.
   * @param {() => HTMLIFrameElement | null} resolver
   * @returns {Events}
   */
  resolveIframeVia(resolver) {
    this.iframeResolver = resolver;
    return this;
  }

  /**
   * Directly set the iframe element.
   * @param {HTMLIFrameElement} iframe
   * @returns {Events}
   */
  setIframe(iframe) {
    this._iframeElement = iframe;
    return this;
  }

  /**
   * Resolves and returns the iframe element if set or lazily resolved.
   * @returns {HTMLIFrameElement | null}
   */
  iframe() {
    if (!this._iframeElement && typeof this.iframeResolver === 'function') {
      try {
        this._iframeElement = this.iframeResolver();
      } catch (e) {
        console.warn('[Events] Failed to resolve iframe:', e);
      }
    }

    return this._iframeElement;
  }

  /**
   * Define all event triggers.
   * @param {string[]} triggers
   * @returns {Events}
   */
  triggers(triggers) {
    this.triggersList = triggers;
    return this;
  }

  /**
   * Finalizes the event system and returns mapped event handlers.
   * @returns {Record<string, { dispatch: Function, listen: Function }>}
   */
  init() {
    this.triggersList.forEach((key) => {
      const kebab = str(key).kebabCase().toString();
      const scream = str(key).screamCase().toString();
      this.eventNames[scream] = kebab;

      this.generated[key] = {
        /**
         * Dispatch event to all relevant windows.
         * @param {any} data
         */
        dispatch: (data = {}) => {
          this._dispatchEverywhere(kebab, data);
        },

        /**
         * Listen for the event in this window.
         * @param {(data: any) => void} callback
         */
        listen: (callback) => {
          document.addEventListener(kebab, (e) => callback(e.detail));
        },
      };
    });

    return this.generated;
  }

  _dispatchEverywhere(name, data = {}) {
    const event = new CustomEvent(name, { detail: data });

    // Dispatch to current window
    document.dispatchEvent(event);

    // Dispatch to parent if in iframe
    if (isIframe()) {
      try {
        window.parent.document.dispatchEvent(event);
      } catch (e) {
        console.warn('[Events] Cannot dispatch to parent:', e);
      }
    }

    // Dispatch to iframe if in parent
    const iframe = this.iframe();
    if (!isIframe() && iframe?.contentDocument) {
      try {
        iframe.contentDocument.dispatchEvent(event);
      } catch (e) {
        console.warn('[Events] Cannot dispatch to iframe:', e);
      }
    }
  }
}
