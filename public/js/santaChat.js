/* global $, setTimeout */

$(function() {
  'use strict';

  $.getScript('/js/commons.js');

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  $.getJSON('api/friends', function(result) {
    result.forEach(function(friend) {
      $('.form-select').append(`<option value="${friend.userId}" data-email="${friend.email}">${friend.name}</option>`);
    });
  });

  $.getJSON('api/chat', chat => {
    for (const item of chat) {
      const date = new Date(item.timestamp);

      let hours = date.getHours();
      hours = hours < 10 ? '0' + hours : hours;

      let minutes = date.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;

      const dateStr = `${hours}:${minutes} - ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
      $('#chat').append('<p>' + item.message + '<span>To: ' + item.name + ' (' + dateStr + ')' + '</span></p>');
    }

    $('#chat').scrollTop($('#chat').prop('scrollHeight'));
  });

  $('#chat-form').on('submit', function() {
    const requestData = {
      userId: +$('#user').val(),
      email: $('#user option:selected').attr('data-email'),
      message: $('#message').val()
    };
    $.post('api/chat', requestData, function(response) {
      $('.alert').removeClass('alert-success alert-danger');
      if (response.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('#chat').append(`<p>${$('input').val()}<span>Just now...</span></p>`);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
        $('.alert').addClass('alert-success');
      }
      $('.alert span').text(response.message);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    });
    return false;
  });

  $('.alert .btn-close').on('click', function() {
    $('.alert').hide();
  });
});
