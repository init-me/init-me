import yylNodeConfig from 'eslint-config-yyl-node'
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...yylNodeConfig,
  {
    ignores: ['node_modules/*', 'output/*', 'test/*']
  },
  {
    languageOptions: {
      globals: {}
    },
    rules: {
      '@typescript-eslint/no-namespace': 'off'
    }
  }
]
