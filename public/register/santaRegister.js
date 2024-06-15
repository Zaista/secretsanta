$(async function () {
  'use strict';

  await $.getScript('/santa.js');

  $('#register-button').on('click', () => {
    // TODO validate email

    // TODO validate password and confirmed password

    const user = {
      email: $('#email').val(),
      password: $('#password').val(),
      name: $('#name').val(),
      address: {
        street: $('#street').val(),
        city: $('#city').val(),
        postalCode: $('#postalCode').val(),
        state: $('#state').val(),
      },
    };

    $.post('api/register', user, function (result) {
      if (result.success) {
        window.location.replace('/?registered');
      }
      showAlert(result);
    });
    return false;
  });
});
