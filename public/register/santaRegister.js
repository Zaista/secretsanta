$(async function() {
  'use strict';

  await $.getScript('/santa.js');

  $('#santaRegisterForm').on('submit', () => {
    // TODO validate email

    // TODO validate password and confirmed password

    const user = {
      email: $('#email').val().toLowerCase(),
      password: $('#password').val(),
      name: $('#name').val(),
      address: {
        street: $('#street').val(),
        city: $('#city').val(),
        postalCode: $('#postalCode').val(),
        state: $('#state').val()
      }
    };

    $.post('api/register', user, function(result) {
      if (result.success) {
        window.location.replace('/?registered');
      }
    });
    return false;
  });
});
