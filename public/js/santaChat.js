/* global $, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  $.getJSON('api/friends', function(result) {
    result.forEach(function(friend) {
      $('#user').append(`<option value="${friend._id}" data-email="${friend.email}">${friend.name}</option>`);
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
      $('#chat').append(`<div id="deleteMsg" class="row position-relative"><div class="col-11" value="${item._id}" ><p>` + item.message + '<span>To: ' + item.name + ' (' + dateStr + ')' + '</span></p></div><div class="col-1 position-absolute top-50 start-100 translate-middle"><i class="buttonDelete bi bi-trash" style="cursor:pointer; color:red"></div></div>');
    }
    $('.buttonDelete').on('click', function() {
      const _id = $(this).parent('div').siblings('div').attr('value');
      $.post('api/delete/msg', { _id }, result => {
      // TODO Handle the response once backend is finished
        if (result.success) $(this).closest('#deleteMsg').remove();
        showAlert(result);
      });
    });

    $('#chat').scrollTop($('#chat').prop('scrollHeight'));
  });

  $('#chat-form').on('submit', function() {
    const requestData = {
      userId: $('#user option:selected').val(),
      email: $('#user option:selected').attr('data-email'),
      message: $('#message').val()
    };
    $.post('api/chat', requestData, function(response) {
      if (!response.error) {
        $('#chat').append(`<p>${$('input').val()}<span>Just now...</span></p>`);
        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
      }
      showAlert(response);
    });
    return false;
  });

  $('.alert .btn-close').on('click', function() {
    $('.alert').hide();
  });
});
