/**
 * Event communication handler between iframe and parent window.
 * Supports:
 * - Event dispatching to self, iframe, and/or parent.
 * - Listening to events on the current window.
 *
 * Usage:
 *
 * ```js
 * const triggers = {
 *   editorReady: '',
 *   toggleSidebar: '',
 *   darkModeEnabled: '',
 * };
 *
 * const events = new Events().iframe({ iframe }).triggers(triggers).init();
 * events.editorReady.dispatch();
 * events.editorReady.listen(data => console.log(data));
 * ```
 */

import { isIframe } from './dom';
import { str } from './strings';

export class Events {
    constructor() {
        this.iframeElement = null;
        this.triggersMap = {};
        this.eventNames = {};
        this.generated = {};
    }

    /**
     * Set iframe reference (optional).
     * @param {Object} options
     * @param {HTMLIFrameElement} options.iframe
     * @returns {Events}
     */
    iframe({ iframe }) {
        this.iframeElement = iframe;
        return this;
    }

    /**
     * Define all event triggers.
     * @param {Record<string, string>} triggers
     * @returns {Events}
     */
    triggers(triggers) {
        this.triggersMap = triggers;
        return this;
    }

    /**
     * Finalizes the event system and returns mapped event handlers.
     * @returns {Record<string, { dispatch: Function, listen: Function }>}
     */
    init() {
        Object.keys(this.triggersMap).forEach((key) => {
            const kebab = str(key).kebab();
            const scream = str(key).screamCase();
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
                    document.addEventListener(kebab, (e) => {
                        callback(e.detail);
                    });
                },
            };
        });

        return this.generated;
    }

    _dispatchEverywhere(name, data = {}) {
        const event = new CustomEvent(name, { detail: data });

        // always dispatch to current window
        document.dispatchEvent(event);

        // dispatch to parent (from iframe)
        if (isIframe()) {
            try {
                window.parent.document.dispatchEvent(event);
            } catch (e) {
                console.warn(`[Events] Cannot dispatch to parent:`, e);
            }
        }

        // dispatch to iframe (from parent)
        if (!isIframe() && this.iframeElement?.contentDocument) {
            try {
                this.iframeElement.contentDocument.dispatchEvent(event);
            } catch (e) {
                console.warn(`[Events] Cannot dispatch to iframe:`, e);
            }
        }
    }
}
