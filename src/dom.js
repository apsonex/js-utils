export const bodyScrollEnable = (doc) => (doc || document).body.style.overflow = null;

export const bodyScrollDisable = (doc) => (doc || document).body.style.overflow = 'hidden';

export const isIframe = (win) => (win || window).location !== (win || window).parent.location;

/**
 * Load a script dynamically if it doesn't already exist.
 *
 * @example
 * loadScript('https://example.com/script.js')
 *   .then(() => console.log('Loaded'))
 *   .catch(err => console.error(err));
 *
 * // With attributes and callbacks
 * loadScript('https://example.com/lib.js', {
 *   type: 'module',
 *   crossorigin: 'anonymous',
 *   onLoad: () => console.log('Script loaded'),
 *   onError: (err) => console.error('Script failed', err),
 * });
 *
 * @param {string} src - URL of the script to load
 * @param {object} attributes - Optional attributes (e.g., type, crossorigin, onLoad, onError)
 * @param {Document} doc - Optional document context (e.g., iframe)
 * @returns {Promise<void>}
 */
export function loadScript(src, attributes = {}, doc = null) {
    const context = doc || document;

    // Return early if script already exists
    const exists = Array.from(context.scripts).some(script => script.src === src);
    if (exists) return Promise.resolve('already exists');

    return new Promise((resolve, reject) => {
        const script = context.createElement('script');
        script.src = src;
        script.async = true;

        const { onLoad, onError, ...otherAttributes } = attributes;

        // Set additional attributes
        Object.entries(otherAttributes).forEach(([key, value]) => {
            script.setAttribute(key, value);
        });

        // Handle success
        script.onload = () => {
            if (typeof onLoad === 'function') onLoad();
            resolve();
        };

        // Handle error
        script.onerror = (err) => {
            if (typeof onError === 'function') onError(err);
            reject(new Error(`Failed to load script: ${src}`));
        };

        context.head.appendChild(script);
    });
}

/**
 * Load a CSS stylesheet dynamically if it doesn't already exist.
 *
 * @example
 * loadStyle('https://example.com/styles.css')
 *   .then(() => console.log('Stylesheet loaded'))
 *   .catch(err => console.error(err));
 *
 * loadStyle('https://example.com/styles.css', {
 *   media: 'all',
 *   onLoad: () => console.log('Style loaded'),
 *   onError: (e) => console.error('Failed to load style', e),
 * });
 *
 * @param {string} href - URL of the stylesheet
 * @param {object} attributes - Optional attributes (media, title, etc), plus onLoad/onError
 * @param {Document} doc - Optional document context (e.g., for iframe)
 * @returns {Promise<void>}
 */
export function loadStyle(href, attributes = {}, doc = null) {
    const context = doc || document;

    // Check if link already exists
    const exists = Array.from(context.querySelectorAll('link[rel="stylesheet"]'))
        .some(link => link.href === href);
    if (exists) return Promise.resolve('already exists');

    return new Promise((resolve, reject) => {
        const link = context.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;

        const { onLoad, onError, ...otherAttributes } = attributes;

        Object.entries(otherAttributes).forEach(([key, value]) => {
            link.setAttribute(key, value);
        });

        link.onload = () => {
            if (typeof onLoad === 'function') onLoad();
            resolve();
        };

        link.onerror = (err) => {
            if (typeof onError === 'function') onError(err);
            reject(new Error(`Failed to load stylesheet: ${href}`));
        };

        context.head.appendChild(link);
    });
}
