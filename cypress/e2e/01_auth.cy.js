// Sign up, sign out, sign in (wrong + right password) and the authenticated navbar
describe('Authentication', () => {
  it('shows the landing page with the site name, logo, Sign Up and Sign In', () => {
    cy.visit('/')
    cy.get('.navbar .logo-text').should('have.text', 'Giftify')
    cy.contains('h1', 'Wish lists your friends can')
    cy.get('.navbar').within(() => {
      cy.contains('a', 'Sign In')
      cy.contains('a', 'Sign Up')
      cy.contains('My Profile').should('not.exist')
    })
    cy.get('footer img[alt="Team Mark"]').should('be.visible')
    cy.screenshot('01-landing')
  })

  it('validates the sign-up form', () => {
    cy.visit('/signup')
    cy.contains('button', 'Sign Up').click()
    cy.contains('Name is required')
    cy.contains('Please enter a valid email address')
    cy.contains('Password must be at least 6 characters')
  })

  it('signs up, signs out and signs back in', () => {
    cy.newUser('auth').then((u) => {
      cy.visit('/signup')
      cy.get('#f-name').type(u.name)
      cy.get('#f-username').type(u.username)
      cy.get('#f-email').type(u.email)
      cy.get('#f-password').type(u.password)
      cy.get('#f-confirm').type(u.password)
      cy.contains('button', 'Sign Up').click()

      // signed in automatically and sent to My Lists
      cy.location('pathname').should('eq', '/lists')
      cy.contains('Welcome to Giftify!')
      cy.get('.navbar').within(() => {
        for (const label of ['Home', 'My Lists', 'Friends', 'Requests', 'My Gifts', 'My Profile']) cy.contains('a', label)
        cy.contains('a', 'My Lists').should('have.class', 'active') // current location
        cy.contains(`@${u.username}`)
      })
      cy.screenshot('02-signed-up')

      cy.contains('button', 'Sign Out').click()
      cy.location('pathname').should('eq', '/signin')
      cy.contains('You have been signed out.')

      cy.uiSignin(u.email, 'wrong-password')
      cy.get('[role=alert]').should('contain', "Email and password don't match.")

      cy.get('#f-password').clear().type(u.password)
      cy.contains('button', 'Sign In').click()
      cy.location('pathname').should('eq', '/')
      cy.contains(`Hi ${u.name.split(' ')[0]}`)
    })
  })

  it('redirects signed-out visitors away from private pages', () => {
    cy.visit('/gifts')
    cy.location('pathname').should('eq', '/signin')
  })
})
