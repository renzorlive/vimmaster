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
            // Keep rules very minimal for now to ease adoption
            "no-unused-vars": "warn",
            "no-undef": "error",
            "no-empty": "warn"
        }
    }
];
