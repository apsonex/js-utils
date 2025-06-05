import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  bodyScrollEnable,
  bodyScrollDisable,
  isIframe,
  loadScript,
  loadStyle,
} from '../src/dom';
import { Window } from 'happy-dom';
const window = new Window({ url: 'https://localhost:8080' });
const document = window.document;

describe('dom.js utilities', () => {
  let doc;

  beforeEach(() => {
    doc = document.implementation.createHTMLDocument('Test');
  });

  describe('bodyScrollEnable / bodyScrollDisable', () => {
    it('should disable and enable scroll on body', () => {
      bodyScrollDisable(document);
      expect(document.body.style.overflow).toBe('hidden');

      bodyScrollEnable(document);
      expect(document.body.style.overflow).toBe('null');
    });
  });

  describe('isIframe', () => {
    it('should detect non-iframe (same window === parent)', () => {
      expect(isIframe(window)).toBe(false);
    });

    it('should detect iframe context via mock', () => {
      const fakeWindow = {
        location: { href: 'https://child.com' },
        parent: { location: { href: 'https://parent.com' } },
      };
      expect(isIframe(fakeWindow)).toBe(true);
    });
  });

  describe('loadScript', () => {
    it('should load a new script and resolve', async () => {
      const result = loadScript('https://example.com/test.js', {}, doc);
      const script = doc.querySelector('script[src="https://example.com/test.js"]');

      expect(script).not.toBeNull();

      // simulate load
      script.onload();
      await expect(result).resolves.toBeUndefined();
    });

    it('should not load duplicate script', async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js', {}, doc);
      const result = await loadScript('https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js', {}, doc);
      expect(result).toBe('already exists');
    });

    it('should call onLoad and onError callbacks', async () => {
      const onLoad = vi.fn();
      const onError = vi.fn();

      const promise = loadScript('https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js', {
        type: 'module',
        onLoad,
        onError,
      }, doc);

      const script = doc.querySelector('script[src="https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js"]');
      script.onload();
      await expect(promise).resolves.toBeUndefined();
      expect(onLoad).toHaveBeenCalled();

      // trigger an error
      const fail = loadScript('https://example.com/fail.js', {
        onError,
      }, doc);

      const errorScript = doc.querySelector('script[src="https://example.com/fail.js"]');
      errorScript.onerror(new Error('fail'));
      await expect(fail).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('loadStyle', () => {
    it('should load a new stylesheet and resolve', async () => {
      const result = loadStyle('https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css', {}, doc);
      const link = doc.querySelector('link[href="https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css"]');

      expect(link).not.toBeNull();

      // simulate load
      link.onload();
      await expect(result).resolves.toBeUndefined();
    });

    it('should not load duplicate stylesheet', async () => {
      await loadStyle('https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css', {}, doc);
      const result = await loadStyle('https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css', {}, doc);
      expect(result).toBe('already exists');
    });

    it('should call onLoad and onError callbacks for stylesheet', async () => {
      const onLoad = vi.fn();
      const onError = vi.fn();

      const promise = loadStyle('https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css', {
        media: 'all',
        onLoad,
        onError,
      }, doc);

      const link = doc.querySelector('link[href="https://cdn.jsdelivr.net/npm/jquery-ui@1.14.1/themes/base/theme.min.css"]');
      link.onload();
      await expect(promise).resolves.toBeUndefined();
      expect(onLoad).toHaveBeenCalled();

      const fail = loadStyle('https://example.com/fail.css', { onError }, doc);
      const errorLink = doc.querySelector('link[href="https://example.com/fail.css"]');
      errorLink.onerror(new Error('fail'));
      await expect(fail).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });
});
