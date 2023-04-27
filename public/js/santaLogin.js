/* global $, setTimeout */

$(function() {
  'use strict';

  $('#santa-login-form').on('submit', function() {
    const userData = {
      username: $('#email').val().toLowerCase(),
      password: $('#password').val()
    };

    $.post('api/login', userData, function(result) {
      if (result.success) {
        window.location.href = '/';
      }
    }, 'json').fail((error) => {
      showAlert(false, `Login failed: ${error.statusText}`);
    });
    return false;
  });

  $('#santa-email-form').on('submit', function() {
    $.post('api/email', { email: $('#santa-email').val() }, function(result) {
      if (result.error) {
        showAlert(false, `Email sent to: ${$('#santa-email').val()}`);
      } else {
        showAlert(true, `Email sent to: ${$('#santa-email').val()}`);
        $('#forgot-password-dialog').toggle();
      }
    }, 'json');
    return false;
  });
});
