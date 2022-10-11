describe('Secret Santa', () => {
  it('User can see his secret santa', () => {
    cy.fixture('user').then((user) => {
      cy.visit('/');
      cy.get('img')
        .should('be.visible')
        .should('have.attr', 'src', 'resources/images/santa.jpg')
        .and(($img) => {
          // "naturalWidth" and "naturalHeight" are set when the image loads
          expect($img[0].naturalWidth).to.be.greaterThan(0);
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        });
  
      cy.get('#santa-username').type(user.username);
      cy.get('#santa-password').type(user.password);


      cy.get('div.buttons button[type="submit"]').click();

      cy.contains('This is not the santa you are looking for.').should('be.visible');
    });
  });

  it('User can see history', () => {
      cy.visit('/');
      cy.contains('History').click();
      cy.contains('2012').click();

      cy.request('api/history').then(response => {
        expect(response.body).to.contain('gifts');
      });

      cy.contains('Location: Laser Tag, Novi Sad').should('be.visible');
  });
});
