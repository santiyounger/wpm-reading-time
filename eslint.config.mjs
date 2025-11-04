// eslint.config.mjs
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default tseslint.config(
	// Ignore patterns (migrated from .eslintignore)
	{
		ignores: [
			"**/node_modules/**",
			"**/main.js",
			"**/*.js.map",
			"**/*.mjs", // Exclude .mjs files from type checking
		],
	},
	// TypeScript ESLint recommended config
	...tseslint.configs.recommendedTypeChecked,
	// Obsidian plugin recommended config
	...obsidianmd.configs.recommended,
	// Parser configuration for TypeScript files
	{
		files: ["**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				// Browser globals for Obsidian plugins
				window: "readonly",
				document: "readonly",
				setTimeout: "readonly",
				clearInterval: "readonly",
				setInterval: "readonly",
			},
		},
		rules: {
			// TypeScript ESLint rules
			"@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-empty-function": "off",
			"no-prototype-builtins": "off",
		},
	},
);

