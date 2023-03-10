module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'space-before-function-paren': ['error', 'never'],
    'semi': ['error', 'always']
  }
}
