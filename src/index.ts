import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { Plugin, ResolvedConfig } from "vite"

/**
 * @example
 * import tscPlugin from "vite-plugin-tsc"
 *
 * export default {
 *   plugins: [tscPlugin()],
 *
 *   // Not required, but recommended.
 *   logLevel: "silent",
 * }
 */
export default function tscPlugin(): Plugin {
  let viteCommand: ResolvedConfig["command"]
  let tsc: ChildProcessWithoutNullStreams

  return {
    name: "vite-plugin-tsc",

    configResolved(config) {
      viteCommand = config.command
    },

    buildStart() {
      const tscCommand = ["tsc", "--pretty", "--noEmit"]

      switch (viteCommand) {
        case "build": {
          tsc = spawn("npx", tscCommand)

          tsc.stdout.once("data", () => {
            process.once("exit", () => {
              console.error("Compile failed")

              process.exit(1)
            })
          })
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

      switch (viteCommand) {
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
