import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import stylisticJs from '@stylistic/eslint-plugin'

export default defineConfig([
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, '@stylistic/js': stylisticJs, },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: { '@stylistic/js/indent': ['error', 2], '@stylistic/js/linebreak-style': ['error', 'unix'], '@stylistic/js/quotes': ['error', 'single'], '@stylistic/js/semi': ['error', 'never'], },
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**'] },
])