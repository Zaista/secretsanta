/* global $, getGroupId, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  $.getJSON(`api/friends?groupId=${groupId}`, function(result) {
    result.forEach(function(friend) {
      $('.form-select').append(`<option value="${friend._id}" data-email="${friend.email}">${friend.name}</option>`);
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
      userId: $('#user option:selected').val(),
      email: $('#user option:selected').attr('data-email'),
      message: $('#message').val()
    };
    console.log(requestData);
    $.post('api/chat', requestData, function(response) {
      if (response.error) {
        showAlert(false, response.message);
      } else {
        $('#chat').append(`<p>${$('input').val()}<span>Just now...</span></p>`);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
        showAlert(true, response.message);
      }
    });
    return false;
  });

  $('.alert .btn-close').on('click', function() {
    $('.alert').hide();
  });
});
