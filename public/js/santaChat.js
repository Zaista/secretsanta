/* global $, setTimeout */

$(function() {
  'use strict';

  $('#menu').load('modules/menu.html', () => {
    $('#menu-chat').addClass('active');
    $('#menu-chat').attr('aria-current', 'page');
  });

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  $.getJSON('api/friends', function(result) {
    result.forEach(function(friend) {
      $('.form-select').append(`<option value="${friend.email}">${friend.firstName}</option>`);
    });
  });

  $.getJSON('api/chat', function(result) {
    for (const message of result) {
      const date = new Date(message.timestamp);

      let hours = date.getHours();
      hours = hours < 10 ? '0' + hours : hours;

      let minutes = date.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;

      const dateStr = `${hours}:${minutes} - ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
      $('#chat').append('<p>' + message.message + '<span>To: ' + message.firstName + ' (' + dateStr + ')' + '</span></p>');
    }

    $('#chat').scrollTop($('#chat').prop('scrollHeight'));
  });

  $('#chat-form').on('submit', function() {
    const requestData = $(this).serialize();
    $.post('api/chat', requestData, function(response) {
      $('.alert').removeClass('alert-success alert-danger alert-warning');
      if (response.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('#chat-message').val('');
        $('#chat').append(`<p>${$('input').val()}<span>Just now...</span></p>`);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));

        $('.alert').addClass('alert-success');
      }
      $('.alert span').text(response.message);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    }, 'json');

    return false;
  });

  $('.alert .btn-close').on('click', function() {
    $('.alert').hide();
  });
});
