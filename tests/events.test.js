// tests/events.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Events } from '../src/events'; // adjust the path as needed
import { Window } from 'happy-dom';
const window = new Window({ url: 'https://localhost:8080' });
const document = window.document;

describe('Events', () => {
  let events;
  let iframeElement;

  const triggers = ['ready', 'parentReady'];

  beforeEach(() => {
    // Create a fake iframe and append it to the DOM
    iframeElement = document.createElement('iframe');
    document.body.appendChild(iframeElement);

    // Initialize Events with iframe resolver
    events = (new Events())
      .resolveIframeVia(() => iframeElement)
      .triggers(triggers)
      .init();
  });

  it('should dispatch and listen on current window', async () => {
    const callback = vi.fn();

    events.ready.listen(callback);
    events.ready.dispatch({ test: true });

    // Wait for the event to propagate
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith({ test: true });
  });

  it('should dispatch to iframe if not inside iframe', async () => {
    const fakeIframeDoc = iframeElement.contentDocument;
    const callback = vi.fn();

    fakeIframeDoc.addEventListener('ready', (e) => {
      callback(e.detail);
    });

    events.ready.dispatch({ source: 'parent' });

    // wait for async dispatch
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith({ source: 'parent' });
  });

  it('should fallback gracefully when iframe dispatch fails', async () => {
    const brokenEvents = new Events()
      .resolveIframeVia(() => ({})) // malformed iframe
      .triggers(triggers)
      .init();

    // should not throw error
    expect(() => {
      brokenEvents.ready.dispatch({ msg: 'fails silently' });
    }).not.toThrow();
  });

  afterEach(() => {
    iframeElement.remove();
  });
});
