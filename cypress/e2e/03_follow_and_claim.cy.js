// The core Giftify flow between two people:
// Ben requests to follow Ava -> Ava approves -> Ben claims a gift -> Ava never sees the claim
describe('Following and claiming gifts', () => {
  let ava, ben, avaToken, listId

  beforeEach(() => {
    cy.newUser('ava').then((u) => (ava = u))
    cy.newUser('ben').then((u) => (ben = u))
    cy.then(() => {
      cy.apiSignup(ava)
      cy.apiSignup(ben)
      cy.apiSignin(ava).then(({ token }) => {
        avaToken = token
        cy.api(token, 'POST', '/api/wishlists', { title: 'Christmas', occasion: 'christmas', eventDate: '2026-12-25' }).then((l) => {
          listId = l._id
          cy.api(token, 'POST', `/api/wishlists/${l._id}/items`, { name: 'Wool scarf', price: 35, priority: 'high' })
          cy.api(token, 'POST', `/api/wishlists/${l._id}/items`, { name: 'Board game', price: 50 })
        })
      })
    })
  })

  it('keeps lists private until the follow is approved, then lets the follower claim', () => {
    // Ben finds Ava and requests to follow
    cy.loginAs(ben)
    cy.visit('/friends')
    cy.get('#people-search').type(ava.username)
    cy.contains('.person', ava.name).contains('View profile').click()
    cy.contains('This account is private')
    cy.contains('button', 'Request to Follow').click()
    cy.contains('button', 'Requested')

    // the list itself is blocked while pending
    cy.then(() => cy.visit(`/lists/${listId}`))
    cy.contains('This wish list is private')

    // Ava approves in the UI
    cy.loginAs(ava)
    cy.visit('/requests')
    cy.get('.navbar .badge').should('contain', '1')
    cy.contains('.person', ben.name).contains('button', 'Approve').click()
    cy.contains(`${ben.name} can now see your wish lists.`)

    // Ben now sees Ava's list on his home page and claims a gift
    cy.loginAs(ben)
    cy.visit('/')
    cy.contains('Upcoming from friends')
    cy.contains('[data-testid=wishlist-card]', 'Christmas').find('h3 a').click()
    cy.get('.navbar').contains('a', 'Friends').should('have.class', 'active')
    cy.contains('[data-testid=item-card]', 'Wool scarf').contains('button', "I'll get this").click()
    cy.contains('[data-testid=item-card]', 'Wool scarf').should('contain', "You're getting this")
    cy.screenshot('04-claimed')

    cy.visit('/gifts')
    cy.contains('tr', 'Wool scarf').should('contain', ava.name).and('contain', '$35.00')

    // Ava (the owner) never sees claim information
    cy.loginAs(ava)
    cy.then(() => cy.visit(`/lists/${listId}`))
    cy.contains('[data-testid=item-card]', 'Wool scarf').should('not.contain', 'Claimed').and('not.contain', 'getting this')
    cy.contains('Claimed items are hidden from you')
  })

  it('stops a second friend from claiming the same gift', () => {
    // Setup through the API: Ben and Cleo both follow Ava and are approved, Ben claims the scarf
    const approve = (user) =>
      cy.apiSignin(user).then(({ token }) =>
        cy.apiSignin(ava).then(({ user: avaUser }) =>
          cy.api(token, 'POST', '/api/follows', { userId: avaUser._id }).then(({ follow }) =>
            cy.api(avaToken, 'PUT', `/api/follows/${follow._id}/accept`).then(() => token)
          )
        )
      )

    cy.newUser('cleo').then((cleo) => {
      cy.apiSignup(cleo)
      approve(ben).then((benToken) =>
        cy.api(benToken, 'GET', `/api/wishlists/${listId}/items`).then((items) => {
          const scarf = items.find((i) => i.name === 'Wool scarf')
          cy.api(benToken, 'POST', `/api/items/${scarf._id}/claim`)

          // Cleo sees it as taken, and the API refuses a second claim (409)
          approve(cleo).then((cleoToken) => {
            cy.request({
              method: 'POST',
              url: `/api/items/${scarf._id}/claim`,
              headers: { Authorization: `Bearer ${cleoToken}` },
              failOnStatusCode: false,
            }).its('status').should('eq', 409)
          })
          cy.loginAs(cleo)
          cy.visit(`/lists/${listId}`)
          cy.contains('[data-testid=item-card]', 'Wool scarf').should('contain', 'Claimed by someone').find('button').should('not.exist')
        })
      )
    })

    // Ben changes his mind and unclaims from the UI
    cy.loginAs(ben)
    cy.then(() => cy.visit(`/lists/${listId}`))
    cy.contains('[data-testid=item-card]', 'Wool scarf').contains('button', 'Unclaim').click()
    cy.contains('Claim removed.')
    cy.contains('[data-testid=item-card]', 'Wool scarf').contains('button', "I'll get this")
  })
})
