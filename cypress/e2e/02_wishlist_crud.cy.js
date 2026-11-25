// Full CRUD on wish lists and items from the React UI
describe('Wish lists and items (CRUD)', () => {
  beforeEach(() => {
    cy.newUser('crud').then((u) => {
      cy.apiSignup(u)
      cy.loginAs(u)
    })
  })

  it('creates, reads, updates and deletes a wish list and its items', () => {
    cy.visit('/lists')
    cy.contains('No wish lists yet')

    // CREATE list
    cy.contains('button', '+ New Wish List').click()
    cy.get('#f-title').type('Birthday 2027')
    cy.get('#f-occasion').select('birthday')
    cy.get('#f-eventDate').type('2027-03-14')
    cy.get('#f-description').type('Turning 28!')
    cy.get('.modal').contains('button', 'Create list').click()
    cy.contains('Created “Birthday 2027”')

    // READ
    cy.get('[data-testid=wishlist-card]').should('have.length', 1).and('contain', 'Birthday 2027').and('contain', 'Mar 14, 2027')

    // UPDATE list
    cy.get('[data-testid=wishlist-card]').contains('button', 'Edit').click()
    cy.get('#f-title').clear().type('Birthday Bash 2027')
    cy.get('.modal').contains('button', 'Save changes').click()
    cy.contains('[data-testid=wishlist-card]', 'Birthday Bash 2027')

    // open the list
    cy.get('[data-testid=wishlist-card] h3 a').click()
    cy.contains('h1', 'Birthday Bash 2027')
    cy.contains('Claimed items are hidden from you')

    // CREATE items
    cy.contains('button', '+ Add Item').click()
    cy.get('#f-name').type('Kindle Paperwhite')
    cy.get('#f-price').type('239')
    cy.get('#f-priority').select('high')
    cy.get('#f-url').type('https://example.com/kindle')
    cy.get('.modal').contains('button', 'Add item').click()
    cy.contains('Added “Kindle Paperwhite”')

    cy.contains('button', '+ Add Item').click()
    cy.get('#f-name').type('Doormat')
    cy.get('#f-priority').select('low')
    cy.get('.modal').contains('button', 'Add item').click()
    cy.get('[data-testid=item-card]').should('have.length', 2)
    cy.contains('2 items')

    // UPDATE item
    cy.contains('[data-testid=item-card]', 'Doormat').contains('button', 'Edit').click()
    cy.get('#f-price').type('25')
    cy.get('#f-notes').type('Something funny')
    cy.get('.modal').contains('button', 'Save changes').click()
    cy.contains('[data-testid=item-card]', 'Doormat').should('contain', '$25.00').and('contain', 'Something funny')
    cy.screenshot('03-list-with-items')

    // DELETE item
    cy.contains('[data-testid=item-card]', 'Doormat').contains('button', 'Delete').click()
    cy.get('.modal').contains('button', 'Delete').click()
    cy.get('[data-testid=item-card]').should('have.length', 1)

    // DELETE list
    cy.contains('button', 'Delete list').click()
    cy.get('.modal').contains('button', 'Delete').click()
    cy.location('pathname').should('eq', '/lists')
    cy.contains('No wish lists yet')
  })

  it('validates the item form', () => {
    cy.visit('/lists')
    cy.contains('button', '+ New Wish List').click()
    cy.get('#f-title').type('Validation test')
    cy.get('.modal').contains('button', 'Create list').click()
    cy.get('[data-testid=wishlist-card] h3 a').click()
    cy.contains('button', '+ Add Item').click()
    cy.get('#f-url').type('not-a-link')
    cy.get('.modal').contains('button', 'Add item').click()
    cy.contains('Item name is required')
    cy.contains('Link must start with http:// or https://')
  })
})
