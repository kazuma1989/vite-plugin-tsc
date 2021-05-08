# vite-plugin-tsc

A Vite plugin which spawns a `tsc --watch` process with Vite dev server.

```console
npm install -D vite-plugin-tsc
```

## How to use

```js
// vite.config.js
import tscPlugin from "vite-plugin-tsc"

/** @type {import("vite").UserConfig} */
const config = {
  plugins: [tscPlugin()],

  // Not required, but recommended.
  logLevel: "silent",
}

export default config
```

And you will get like:

```console
$ npx vite

[13:32:56] File change detected. Starting incremental compilation...

src/index.tsx:21:7 - error TS2322: Type 'boolean' is not assignable to type 'string'.

21 const message: string = false
         ~~~~~~~

[13:32:56] Found 1 error. Watching for file changes.
```

## Why it is a Vite only plugin?

It uses a `configResolved` hook.
