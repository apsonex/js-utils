# @apsonex/js-utils

> A small, useful utility collection for JavaScript/ESM projects — includes string helpers, DOM utilities, a simple localStorage-based caching system, and an event bridge between iframes and parent windows.

---

## 📦 Installation

```bash
npm install @apsonex/js-utils
```

---

## 🛠 Usage

```js
import {
  JsCache,
  str,
  bodyScrollEnable,
  bodyScrollDisable,
  isIframe,
  loadScript,
  loadStyle,
  Events,
} from '@apsonex/js-utils';
```

---

## 📚 Features

### 🔡 String Utilities (`str`)
Powerful string helper chainable class.

```js
str("hello world").kebabCase().toString(); // "hello-world"
str("some/some.txt").afterLast("/").toString(); // "some.txt"
str("html content").minifyHtml(); // removes whitespace, comments
```

Chainable methods:
- `after`, `afterLast`, `before`, `beforeLast`
- `kebabCase`, `camelCase`, `snakeCase`, `screamCase`, `snakeCase`, `slug`, `plural`, `singular`
- `replaceFirst`, `replaceLast`, `replaceArray`
- `limit`, `words`, `start`, `finish`
- `contains`, `containsAll`, `is`, `startsWith`, `endsWith`
- `title`, `minifyHtml`, `explode`

---

### 📦 Local Cache (`JsCache`)
Simple localStorage cache with TTL (time to live) support.

```js
const cache = new JsCache().init({ prefix: 'my_app:' });

cache.put('user', { name: 'John' }, '10m');
cache.remember('settings', '1hr', () => fetchSettings());
```

Supports TTL formats:
- `60s`, `10m`, `1hr`, `1d`, `1mo`, `1yr`, or numeric seconds

Methods:
- `put(key, value, ttl)`
- `remember(key, ttl, fallback)`
- `get(key)`
- `has(key)`
- `forget(key)`

---

### 🧩 DOM Utilities (`dom`)
Lightweight, useful browser DOM helpers.

```js
bodyScrollDisable(); // disables body scroll
bodyScrollEnable();  // enables it back

isIframe(); // true if running inside iframe
```

---

### 📜 `loadScript` & `loadStyle`
Dynamically load external scripts or stylesheets.

```js
await loadScript('https://example.com/script.js', {
  type: 'module',
  onLoad: () => console.log('loaded'),
  onError: (err) => console.error(err),
});

await loadStyle('https://example.com/style.css', {
  media: 'all',
});
```

They support:
- Auto-skip if already loaded
- `onLoad`, `onError` callbacks
- Custom attributes like `crossorigin`, `media`, `title`

---

### 🔁 Iframe Events (`Events`)
Two-way communication between parent window and iframe using `CustomEvent`.

#### ✅ Features
- Dispatch events across iframe and parent
- Auto-generated `.dispatch()` and `.listen()` methods
- Works with or without iframe
- IDE autocompletion friendly

#### 📌 Usage with iframe

```js
const triggers = {
  editorReady: '',
  toggleSidebar: '',
  darkModeEnabled: '',
};

const events = new Events()
  .iframe({ iframe: document.getElementById('my-iframe') })
  .triggers(triggers)
  .init();

events.editorReady.dispatch({ status: 'ready' });

events.darkModeEnabled.listen((data) => {
  console.log('Dark mode changed:', data);
});
```

#### 📌 Usage without iframe

```js
const events = new Events()
  .triggers({
    saveComplete: '',
    errorOccurred: '',
  })
  .init();

events.saveComplete.dispatch({ id: 123 });
events.errorOccurred.listen((err) => {
  console.error(err);
});
```

#### 💡 IDE Typing

```js
/** @typedef {ReturnType<Events['init']>} EventMap */
/** @type {EventMap} */
const events = new Events().triggers(triggers).init();
```

---

## 🧪 Build

```bash
npm run build
```

Outputs ES module and UMD builds in `/dist`.

---

## 📄 License

MIT License © [Apsonex Inc.](https://apsonex.com)
