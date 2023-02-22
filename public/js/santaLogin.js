/* global $, setTimeout */

$(function () {
  'use strict';

  $('#santa-login-form').on('submit', function () {
    const userData = {
      username: $('#santa-username').val().toLowerCase(),
      password: $('#santa-password').val()
    };

    $.post('api/login', userData, function (result) {
      if (result.error) {
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-danger');
        $('.alert span').text(result.error);
        $('.alert').show();
        setTimeout(function () {
          $('.alert').hide();
        }, 3000);
      } else {
        window.location.href = '/';
      }
    }, 'json');
    return false;
  });

  $('#santa-email-form').on('submit', function () {
    $.post('api/email', { email: $('#santa-email').val() }, function (result) {
      $('.alert').removeClass('alert-success alert-danger');
      if (result.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('.alert').hide();
      }
      $('.alert span').text(result.message);
      $('.alert').show();
      setTimeout(function () {
        $('.alert').hide();
      }, 3000);
    }, 'json');
    return false;
  });
});
