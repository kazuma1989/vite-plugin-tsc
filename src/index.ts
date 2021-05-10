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
  let viteCommand: ResolvedConfig["command"] | undefined
  let tsc: ChildProcess | undefined

  return {
    name: "vite-plugin-tsc",

    configResolved(config) {
      viteCommand = config.command
    },

    buildStart() {
      if (tsc) return

      switch (viteCommand) {
        case "build": {
          tsc = spawnTsc()

          tsc.once("exit", (tscExitCode) => {
            // success
            if (tscExitCode === null || tscExitCode === 0) return

            // bail now because it may not be a compile error but cli error
            if (tscExitCode === 1) {
              process.exit(tscExitCode)
            }

            // awaits build finish
            process.once("exit", () => {
              console.error("Compile failed")
              process.exit(tscExitCode)
            })
          })
          break
        }

        case "serve": {
          tsc = spawnTsc("--watch")

          tsc.once("exit", (tscExitCode) => {
            // success
            if (tscExitCode === null || tscExitCode === 0) return

            // bail now because it may not be a compile error
            process.exit(tscExitCode)
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

/**
 * @example
 * spawnTsc()           // npx tsc --pretty --noEmit
 * spawnTsc("--watch")  // npx tsc --pretty --noEmit --watch
 */
function spawnTsc(...args: string[]): ChildProcess {
  return spawn("npx", ["tsc", "--pretty", "--noEmit", ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
  })
}
