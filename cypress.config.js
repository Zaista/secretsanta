const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'secretsanta',
  e2e: {
    setupNodeEvents (on, config) {
      require('@deploysentinel/cypress-debugger/plugin')(on, config);
    },
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
});
