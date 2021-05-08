import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { Plugin, ResolvedConfig } from "vite"

/**
 * @example
 * import VitePluginTsc from "vite-plugin-tsc"
 *
 * export default {
 *   plugins: [VitePluginTsc()],
 *
 *   // Not required, but recommended.
 *   logLevel: "silent",
 * }
 */
export default function VitePluginTsc(): Plugin {
  let command: ResolvedConfig["command"]
  let tsc: ChildProcessWithoutNullStreams

  return {
    name: "vite-plugin-tsc",

    configResolved(config) {
      command = config.command
    },

    buildStart() {
      const tscCommand = ["tsc", "--pretty", "--noEmit"]

      switch (command) {
        case "build": {
          tsc = spawn("npx", tscCommand)
          break
        }

        case "serve": {
          tsc = spawn("npx", [...tscCommand, "--watch"])
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
