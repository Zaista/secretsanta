/*global $, document, setTimeout */

$(document).ready(function () {
    "use strict";

    $.get('getMessages.php', function(result) {
        var messages = JSON.parse(result);
        for (var message of messages) {
            var date = new Date(message.Timestamp);
            var dateStr = date.getHours() + ":" + date.getMinutes() + " (" + date.getDay() + "." + date.getMonth() + ")";
            $('#chat').append('<p>' + message.Message + '<span>' + dateStr + "" + '</span></p>');
        }

        $('#chat').scrollTop($('#chat').prop("scrollHeight"));
    });

    $('#chat-button').click(function() {
        var message = $('#chat-message').val();
        $('#chat-message').val('');
        $.post('postMessage.php', {message: message}, function(result) {
            $('.alert span').text('Message sent. Be sure the ping the person so he/she knows a question is asked.');
            $('.alert').show();
            setTimeout(function() {
                $('.alert').hide();
            }, 3000);
            $('#chat').append('<p>' + message + '<span>Just now...</span></p>');
            $('#chat').scrollTop($('#chat').prop("scrollHeight"));
        });
    });

    $('#chat-ping-button').click(function() {
        var person_id = $('#chat-ping-select').val();
        $.get('pingPerson.php', {person: person_id}, function(data, status) {
            console.log(status);
            console.log(data);
            $('.alert span').text('Person pinged. He/she will receive an email that a question has been asked.');
            $('.alert').show();
            setTimeout(function() {
                $('.alert').hide();
            }, 3000);
        });
    });

    $('.alert .btn-close').click(function() {
        $('.alert').hide();
    });
});