const apiUrl = 'chat/api';
const friendsApiUrl = 'friends/api';

$(async function() {
  'use strict';

  let chatId;
  let chatEl;

  await $.getScript('/santa.js');

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  $.getJSON(`${friendsApiUrl}/list`, function(result) {
    result.forEach(function(friend) {
      $('#user').append(`<option value="${friend._id}" data-email="${friend.email}">${friend.name}</option>`);
    });
  });

  $.getJSON(`${apiUrl}/list`, chat => {
    $.get('chat/message.html', chatTemplate => {
      for (const item of chat) {
        const date = new Date(item.timestamp);

        let hours = date.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        let minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const dateStr = `${hours}:${minutes} - ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;

        const chatElement = $.parseHTML(chatTemplate);
        $(chatElement).find('[data-name="chatTo"]').text(`To: ${item.name}`);
        $(chatElement).find('[data-name="chatMessage"]').text(item.message);
        $(chatElement).find('[data-name="chatDate"]').text(dateStr);
        $(chatElement).find('[data-name="chatFrom"]').text(`From: ${item.from || 'Anonymous'}`);

        $(chatElement).find('[data-name="msgDelete"]').on('click', function() {
          chatId = item._id;
          chatEl = chatElement;
        });
        $('#chat').append(chatElement);
      }

      $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    });
  });

  $('#chat-form').on('submit', function() {
    const requestData = {
      userId: $('#user option:selected').val(),
      email: $('#user option:selected').attr('data-email'),
      message: $('#message').val()
    };
    $.post(`${apiUrl}/send`, requestData, function(response) {
      if (!response.error) {
        $.get('chat/message.html', chatTemplate => {
          const chatElement = $.parseHTML(chatTemplate);
          $(chatElement).find('[data-name="chatTo"]').text(`To: ${$('#user option:selected').text()}`);
          $(chatElement).find('[data-name="chatMessage"]').text(requestData.message);
          $(chatElement).find('[data-name="chatDate"]').text('Just now...');
          $(chatElement).find('[data-name="chatFrom"]').text('From: you');

          $(chatElement).find('[data-name="msgDelete"]').on('click', function() {
            chatId = response.insertedId;
            chatEl = chatElement;
          });
          $('#chat').append(chatElement);
          $('#chat').scrollTop($('#chat').prop('scrollHeight'));

          // Reset the form
          $('#chat-form')[0].reset();
        });
      }
      showAlert(response);
    });
    return false;
  });

  $('.alert .btn-close').on('click', function() {
    $('.alert').hide();
  });

  $('#deleteMessageButton').on('click', () => {
    $.post(`${apiUrl}/delete`, { _id: chatId }, result => {
      showAlert(result);
      if (result.success) {
        $(chatEl).remove();
      }
    });
  });
});
