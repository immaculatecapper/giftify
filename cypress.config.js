import { defineConfig } from 'cypress'

// End-to-end tests. Start the app first (npm run dev, or npm run build && npm start),
// then: npx cypress open   (interactive)   or   npm run test:e2e   (headless, records videos)
export default defineConfig({
  // Cypress Cloud project (needed for --record and the cy.prompt AI spec). Not a secret; the record key is.
  projectId: 'ey3av9',
  // the tests don't use Cypress.env(), so turn it off (removes the deprecation warning)
  allowCypressEnv: false,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
  },
  video: true, // a .mp4 of every spec is saved in cypress/videos
  videoCompression: true,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
})
