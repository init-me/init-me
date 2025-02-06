import yylNodeConfig from 'eslint-config-yyl-node'
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...yylNodeConfig,
  {
    ignores: ['node_modules/*', 'output/*', 'test/*', 'seed/', 'npmignore', 'gitignore']
  },
  {
    languageOptions: {
      globals: {}
    },
    rules: {}
  }
]
