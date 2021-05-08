/// <reference lib="es2019" />

import { spawn } from "child_process"

/** @returns {import("vite").Plugin} */
export default function VitePluginTsc() {
  /** @type {"build" | "serve"} */
  let command
  /** @type {import("child_process").ChildProcess} */
  let tsc

  return {
    name: "vite-plugin-tsc",

    configResolved(config) {
      command = config.command
    },

    buildStart() {
      switch (command) {
        case "build": {
          tsc = spawn("npx", ["tsc", "--pretty"])
          break
        }

        case "serve": {
          tsc = spawn("npx", ["tsc", "--pretty", "--watch"])
          break
        }
      }

      tsc.stdout.pipe(process.stdout)
      tsc.stderr.pipe(process.stderr)
    },

    buildEnd() {
      if (!tsc) return

      switch (command) {
        case "build": {
          // do nothing
          break
        }

        case "serve": {
          tsc.kill()
          break
        }
      }
    },
  }
}
