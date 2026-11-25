// Reusable Cypress commands for Giftify

// Unique test users so the specs can be re-run against the same database
Cypress.Commands.add('newUser', (prefix = 'cy') => {
  const id = `${prefix}${Date.now().toString(36)}${Cypress._.random(100, 999)}`
  return cy.wrap({ name: `${prefix.toUpperCase()} Tester ${id.slice(-4)}`, username: id, email: `${id}@test.giftify`, password: 'Password1' })
})

// Create an account through the API (faster than the UI when it's just setup)
Cypress.Commands.add('apiSignup', (user) =>
  cy.request('POST', '/api/users', user).its('body.user')
)

// Sign in through the API and return { token, user }
Cypress.Commands.add('apiSignin', (user) =>
  cy.request('POST', '/auth/signin', { email: user.email, password: user.password }).its('body')
)

// Sign in and put the session in localStorage exactly like the React app does
Cypress.Commands.add('loginAs', (user) =>
  cy.apiSignin(user).then(({ token, user: u }) => {
    window.localStorage.setItem('giftify.session', JSON.stringify({ token, user: u }))
    return { token, user: u }
  })
)

// Authenticated API request helper for test setup
Cypress.Commands.add('api', (token, method, url, body) =>
  cy.request({ method, url, body, headers: { Authorization: `Bearer ${token}` } }).its('body')
)

// Sign in through the UI
Cypress.Commands.add('uiSignin', (login, password) => {
  cy.visit('/signin')
  cy.get('#f-login').type(login)
  cy.get('#f-password').type(password, { log: false })
  cy.contains('button', 'Sign In').click()
})
