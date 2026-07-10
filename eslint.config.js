import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            // Hygiene gate (TD-11): violations are errors so they cannot
            // creep back in. CI runs eslint on every PR.
            "no-unused-vars": "error",
            "no-undef": "error",
            "no-empty": ["error", { "allowEmptyCatch": false }],
            "no-debugger": "error",
            // App code logs through js/logger.js (structured categories,
            // debug filtering via localStorage.vimMasterDebug) — never
            // through console directly.
            "no-console": "error"
        }
    },
    {
        // The logger's ConsoleAdapter is the one legitimate console user
        files: ["js/logger.js"],
        rules: {
            "no-console": "off"
        }
    },
    {
        // CLI tooling and test runners print to the terminal by design
        files: ["scripts/**", "tests/**"],
        rules: {
            "no-console": "off"
        }
    }
];
