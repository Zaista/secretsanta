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
      $('.alert').removeClass('alert-success alert-danger');
      $('.alert').addClass('alert-danger');
      $('.alert span').text(`Login failed: ${error.statusText}`);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    });
    return false;
  });

  $('#santa-email-form').on('submit', function() {
    $.post('api/email', { email: $('#santa-email').val() }, function(result) {
      $('.alert').removeClass('alert-success alert-danger');
      if (result.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('.alert').addClass('alert-success');
        $('#forgot-password-dialog').toggle();
      }
      $('.alert span').text(`Email sent to: ${$('#santa-email').val()}`);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    }, 'json');
    return false;
  });
});
