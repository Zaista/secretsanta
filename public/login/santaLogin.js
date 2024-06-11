$(async function() {
  'use strict';

  await $.getScript('/santa.js');

  $('#login-button').on('click', function() {
    const userData = {
      username: $('#email').val(),
      password: $('#password').val()
    };

    $.post('api/login', userData, function(result) {
      if (result.success) {
        window.location.href = '/';
      }
    }, 'json').fail(() => {
      showAlert({ error: 'Email or password wrong' });
    });
    return false;
  });

  $('#email').on('keypress', e => {
    if (e.which === 13) {
      $('#password').focus();
    }
  });

  $('#password').on('keypress', e => {
    if (e.which === 13) {
      $('#login-button').click();
    }
  });

  $('#santa-email-form').on('submit', function() {
    $.post('api/email', { email: $('#santa-email').val() }, function(result) {
      $('#forgot-password-dialog').modal('hide');
      showAlert(result);
    }, 'json');
    return false;
  });
});
