// User object CRUD from the My Profile page (Create is covered by sign up)
describe('My Profile', () => {
  it('reads, updates and deletes my account', () => {
    cy.newUser('prof').then((u) => {
      cy.apiSignup(u)
      cy.loginAs(u)
      cy.visit('/profile')
      cy.get('.navbar').contains('a', 'My Profile').should('have.class', 'active')
      cy.contains('h2', u.name)
      cy.contains(`@${u.username}`)

      // UPDATE
      cy.contains('button', 'Edit profile').click()
      cy.get('#f-name').clear().type('Renamed Tester')
      cy.get('#f-bio').type('I love board games.')
      cy.get('#f-birthday').type('1999-03-14')
      cy.contains('button', 'Save profile').click()
      cy.contains('Profile saved.')
      cy.contains('h2', 'Renamed Tester')
      cy.contains('I love board games.')
      cy.contains('Mar 14, 1999')
      cy.screenshot('05-profile-updated')

      // DELETE
      cy.contains('button', 'Delete account').click()
      cy.get('.modal').contains('button', 'Delete my account').click()
      cy.location('pathname').should('eq', '/')
      cy.get('.navbar').contains('a', 'Sign Up')

      // the account is gone
      cy.uiSignin(u.email, u.password)
      cy.get('[role=alert]').should('contain', 'User not found')
    })
  })
})
