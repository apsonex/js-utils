import { isIframe } from "./dom";
import { str } from "./strings";

/**
 * Generic event communication handler between iframe and parent window.
 * Supports:
 * - Dispatching events to self, iframe, and/or parent.
 * - Listening to events on the current window.
 *
 * Usage:
 *
 * ```ts
 * const triggers = ['ready', 'parentReady'] as const;
 * type MyEvents = typeof triggers[number];
 *
 * const events = new Events<MyEvents>()
 *   .resolveIframeVia(() => store().iframe)
 *   .triggers(triggers as MyEvents[])
 *   .init();
 *
 * events.ready.dispatch();
 * events.ready.listen(data => console.log(data));
 * ```
 */
export class Events<T extends string = string> {
    private _iframeElement: HTMLIFrameElement | null = null;
    private iframeResolver: (() => HTMLIFrameElement | null) | null = null;
    private triggersList: T[] = [];
    private eventNames: Record<string, string> = {};
    private generated: Partial<
        Record<
            T,
            {
                dispatch: (data?: any) => void;
                listen: (callback: (data: any) => void) => () => void;
            }
        >
    > = {};

    /**
     * Define a resolver to lazily get the iframe element.
     */
    resolveIframeVia(resolver: () => HTMLIFrameElement | null): this {
        this.iframeResolver = resolver;
        return this;
    }

    /**
     * Directly set the iframe element.
     */
    setIframe(iframe: HTMLIFrameElement): this {
        this._iframeElement = iframe;
        return this;
    }

    /**
     * Resolves and returns the iframe element if set or lazily resolved.
     */
    iframe(): HTMLIFrameElement | null {
        if (!this._iframeElement && typeof this.iframeResolver === "function") {
            try {
                this._iframeElement = this.iframeResolver();
            } catch (e) {
                console.warn("[Events] Failed to resolve iframe:", e);
            }
        }
        return this._iframeElement;
    }

    /**
     * Define all event triggers.
     */
    triggers(triggers: T[]): this {
        this.triggersList = triggers;
        return this;
    }

    /**
     * Finalizes the event system and returns mapped event handlers.
     */
    init(): Record<
        T,
        {
            dispatch: (data?: any) => void;
            listen: (callback: (data: any) => void) => () => void;
        }
    > {
        this.triggersList.forEach((key) => {
            const kebab = str(key).kebabCase().toString();
            const scream = str(key).screamCase().toString();
            this.eventNames[scream] = kebab;

            this.generated[key] = {
                dispatch: (data: any = {}) => {
                    this._dispatchEverywhere(kebab, data);
                },

                listen: (callback: (data: any) => void) => {
                    const handler = (e: Event) => {
                        callback((e as CustomEvent).detail);
                    };
                    document.addEventListener(kebab, handler);
                    return () => document.removeEventListener(kebab, handler);
                },
            };
        });

        return this.generated as Record<
            T,
            {
                dispatch: (data?: any) => void;
                listen: (callback: (data: any) => void) => () => void;
            }
        >;
    }

    /**
     * Internal method to dispatch event to self, parent, and iframe.
     */
    private _dispatchEverywhere(name: string, data: any = {}) {
        const event = new CustomEvent(name, { detail: data });

        // Dispatch to current window
        document.dispatchEvent(event);

        // Dispatch to parent if in iframe
        if (isIframe()) {
            try {
                window.parent.document.dispatchEvent(event);
            } catch (e) {
                console.warn("[Events] Cannot dispatch to parent:", e);
            }
        }

        // Dispatch to iframe if in parent
        const iframe = this.iframe();
        if (!isIframe() && iframe?.contentDocument) {
            try {
                iframe.contentDocument.dispatchEvent(event);
            } catch (e) {
                console.warn("[Events] Cannot dispatch to iframe:", e);
            }
        }
    }
}
