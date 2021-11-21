describe('Secret Santa', () => {
  it('See secret santa', () => {
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

      cy.get('#santa_name').should('have.text', 'Jovana Stašuk');
      cy.get('#santa-display img').should('have.attr', 'src', 'resources/images/jovana.png');
      cy.get('#santa_address').should('have.text', 'Address: Narodnog Fronta 15/53, 21000 Novi Sad, Serbia');
    });
  });
});
