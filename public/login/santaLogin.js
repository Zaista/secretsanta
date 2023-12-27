$(async function() {
  'use strict';

  await $.getScript('/santa.js');

  $('#santaLoginForm').on('submit', function() {
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

  $('#santa-email-form').on('submit', function() {
    $.post('api/email', { email: $('#santa-email').val() }, function(result) {
      $('#forgot-password-dialog').modal('hide');
      showAlert(result);
    }, 'json');
    return false;
  });
});
