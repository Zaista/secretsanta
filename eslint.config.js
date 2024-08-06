import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ignores: ['public/utils/*', 'private/*'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jquery,
        ...globals.browser,
        showAlert: 'readonly',
        bootstrap: 'readonly',
        Croppie: 'readonly',
        pageLoaded: 'readonly',
      },
    },
    rules: {
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      'no-console': ['warn'],
    },
  },
  js.configs.recommended,
];
