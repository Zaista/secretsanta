/* global $, setTimeout */

$(function() {
  'use strict';

  $('#menu').load('views/menu');

  // send a username and password, get the santa name and address and display it
  $.get('api/santa', function(result, status) {

  });

  $.getJSON('api/users', function(result) {
    $.get('modules/user.html', userTemplate => {
      $.each(result, function(index, userData) {
        const userElement = $.parseHTML(userTemplate);
        $(userElement).find('#index').text(++index);
        $(userElement).find('#name').text(userData.name);
        $(userElement).find('#email').text(userData.email);
        if (userData.active) {
          $(userElement).find('#status').attr('checked', true);
        }
        $('#users tbody').append(userElement);
      });
    });
  });

  $('#emailPasswords').on('click', function() {
    const personId = $('#email-select').val();
    $.getJSON('api/email?person=' + personId, function(result) {
      if (result.error) {
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-danger');
        $('.alert span').text(result.error);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
      } else {
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-success');
        $('.alert span').text(result.success);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
      }
    });
  });
});
