# @apsonex/js-utils
Two
> A small, useful utility collection for JavaScript/ESM projects — includes string helpers, DOM utilities, a localStorage-based cache, event communication layer, and pipeline processing.

---

## 📦 Installation

```bash
npm install @apsonex/js-utils
```

Or using Yarn:

```bash
yarn add @apsonex/js-utils
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
  Pipeline,
} from '@apsonex/js-utils';
```

---

## 📚 Features

### 🔡 String Utilities (`str`)
Chainable utility class for common string operations.

```js
str("hello world").kebabCase().toString(); // "hello-world"
str("some/filename.txt").afterLast("/").toString(); // "filename.txt"
str("html content").minifyHtml(); // removes whitespace, comments
str("HELLO_WORLD").sentenseCase().toString(); // "Hello World"
```

**Chainable Methods:**

- `after`, `afterLast`, `before`, `beforeLast`
- `kebabCase`, `camelCase`, `snakeCase`, `slug`, `plural`, `singular`
- `screamCase`, `titleCase`, `capitalizeWords`
- `replaceFirst`, `replaceLast`, `replaceArray`
- `limit`, `words`, `startCase`, `finish`
- `contains`, `containsAll`, `is`, `startsWith`, `endsWith`
- `title`, `minifyHtml`, `explode`

**Notable Additions:**
- `sentenseCase()`: Transforms strings like `"HELLO_WORLD"` into `"Hello World"`
- `capitalizeWords()`: Capitalizes the first letter of each word

---

### 📦 Local Cache (`JsCache`)
Simple localStorage cache with TTL support.

```js
const cache = new JsCache().init({ prefix: 'my_app:' });

cache.put('user', { name: 'John' }, '10m');
cache.remember('settings', '1hr', () => fetchSettings());
```

TTL formats:
- `60s`, `10m`, `1hr`, `1d`, `1mo`, `1yr`, or numeric seconds

Methods:
- `put(key, value, ttl)`
- `remember(key, ttl, fallback)`
- `get(key)`
- `has(key)`
- `forget(key)`

---

### 🧩 DOM Utilities
Useful browser DOM helpers.

```js
bodyScrollDisable(); // disables body scroll
bodyScrollEnable();  // re-enables scroll

isIframe(); // true if in an iframe
```

---

### 📜 Dynamic Script & Style Loaders
Load external assets with callbacks and deduplication.

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

Features:
- Prevents duplicate loading
- Supports `onLoad`, `onError`, `crossorigin`, `type`, etc.

---

### 📡 Events System (`Events`)
Handles safe cross-window event communication (parent ↔ iframe) with unified API.

```js
const triggers = ['ready', 'parentReady'];

const events = new Events()
  .resolveIframeVia(() => store().iframe)
  .triggers(triggers)
  .init();

events.ready.dispatch({ hello: 'world' });
events.ready.listen((data) => console.log('Received:', data));
```

API:
- `.setIframe(iframeElement)`
- `.resolveIframeVia(() => iframeElement)`
- `.triggers(['eventOne', 'eventTwo'])`
- `.init()` returns trigger handlers

Each trigger provides:
- `.dispatch(data)`
- `.listen(callback)`

---

### 🔁 Pipeline Processor (`Pipeline`)
Chain synchronous or async tasks for consistent data flow.

```js
const pipeline = new Pipeline()
  .pipe([
    (data) => data + 1,
    async (data) => data * 2,
    (data) => `Final: ${data}`,
  ]);

pipeline.process(2).then(console.log); // Final: 6
```

Methods:
- `pipe(fn | fn[])` — add processing steps
- `empty()` — reset pipeline
- `process(input)` — run through all stages

Each stage can be:
- A function `(input) => output`
- A static value that skips input

---

## 🧪 Build

```bash
npm run build
```

Outputs:
- ES Module (`dist/*.es.js`)
- UMD Module (`dist/*.umd.js`)

---

## 📄 License

MIT License © [Apsonex Inc.](https://apsonex.com)
