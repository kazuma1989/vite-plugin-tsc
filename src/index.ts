import { ChildProcess, spawn } from "child_process"
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
  let tsc: ChildProcess

  return {
    name: "vite-plugin-tsc",

    configResolved(config) {
      viteCommand = config.command
    },

    buildStart() {
      const tscCommand = ["tsc", "--pretty", "--noEmit"]

      switch (viteCommand) {
        case "build": {
          tsc = spawn("npx", tscCommand, {
            stdio: "inherit",
          })

          tsc.once("exit", (tscExitCode) => {
            if (tscExitCode === null || tscExitCode === 0) return

            process.once("exit", () => {
              console.error("Compile failed")
              process.exit(tscExitCode)
            })
          })
          break
        }

        case "serve": {
          tsc = spawn("npx", [...tscCommand, "--watch"], {
            stdio: "inherit",
          })
          break
        }
      }
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
