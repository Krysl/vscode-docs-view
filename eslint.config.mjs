import tseslint from 'typescript-eslint';
import eslint from "@eslint/js";

/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
export default tseslint.config({
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	languageOptions: {
		parser: tseslint.parser,
	},
	files: ["src/**/*.ts"],
	extends: [
		eslint.configs.recommended,
		...tseslint.configs.recommended,
	],
	rules: {
		'semi': [2, "always"],
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
	}
}, {
	plugins: {
		'@typescript-eslint': tseslint.plugin,
	},
	languageOptions: {
		parser: tseslint.parser,
	},
	files: ["media/**/*.js"],
	extends: [
		eslint.configs.recommended,
		...tseslint.configs.recommended,
	],
	rules: {
		'semi': [2, "always"],
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
	}
});