// AI-written test with cy.prompt() (Cypress 15.13+).
// cy.prompt turns plain-English steps into real Cypress commands and shows the code it generated
// ("Code" button in the Command Log), which can be saved back into the spec.
// Requires signing in to Cypress Cloud in the Cypress app (free plan works), or running with --record.
// Not part of "npm run test:e2e" (it needs a Cloud sign-in). Run it with  npm run test:e2e:ai
//   then pick 05_ai_prompt.cy.js in the Cypress app.
describe('AI (cy.prompt) – create a wish list in plain English', () => {
  let user

  before(() => {
    cy.newUser('ai').then((u) => {
      user = u
      cy.apiSignup(u)
    })
  })

  it('signs in and creates a wish list from natural-language steps', function () {
    if (typeof cy.prompt !== 'function') this.skip()

    cy.prompt(
      [
        'visit /signin',
        'type {{email}} in the "Email or username" field',
        'type {{password}} in the "Password" field',
        'click the "Sign In" submit button inside the sign-in form card (not the link in the header)',
        'verify the "My Lists" link is visible in the navigation bar',
        'click the "My Lists" link in the navigation bar',
        'click the "+ New Wish List" button',
        'type "Graduation party" in the "Title" field',
        'select the option with value "graduation" in the "Occasion" dropdown',
        'click the "Create list" button in the dialog',
        'verify the page shows a wish list card containing "Graduation party"',
      ],
      // placeholders are filled in locally and never sent to the AI model
      { placeholders: { email: user.email, password: user.password } }
    )
    cy.screenshot('06-ai-prompt-result')
  })
})
