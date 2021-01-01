/*global $, document, setTimeout */

$(document).ready(function () {
    "use strict";

    $.get('api/getMessages.php', function (result) {
        var messages = JSON.parse(result);
        for (var message of messages) {
            var date = new Date(message.Timestamp);
            var dateStr = date.getHours() + ":" + date.getMinutes() + " (" + date.getDay() + "." + date.getMonth() + ")";
            $('#chat').append('<p>' + message.Message + '<span>' + dateStr + "" + '</span></p>');
        }

        $('#chat').scrollTop($('#chat').prop("scrollHeight"));
    });

    $('#chat-button').click(function () {
    });

    $('#chat-ping-button').click(function () {

        var message = $('#chat-message').val();
        if (message === "") {
            $('.alert').removeClass('alert-success alert-danger');
            $('.alert').addClass('alert-danger');
            $('.alert span').text("Question field is empty.");
            $('.alert').show();
            setTimeout(function () {
                $('.alert').hide();
            }, 3000);
            return;
        }

        var person_id = $('#chat-ping-select').val();
        if (person_id == 0) {
            $('.alert').removeClass('alert-success alert-danger');
            $('.alert').addClass('alert-danger');
            $('.alert span').text("Please select a person.");
            $('.alert').show();
            setTimeout(function () {
                $('.alert').hide();
            }, 3000);
            return;
        }

        $.post('api/askQuestion.php', { person: person_id, message: message}, function (data) {
            var result = JSON.parse(data);
            if (result.error) {
				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-danger');
                $('.alert span').text(result.error);
                $('.alert').show();
                setTimeout(function () {
                    $('.alert').hide();
                }, 3000);
            } else {
                $('#chat-message').val('');
                $('#chat').append('<p>' + message + '<span>Just now...</span></p>');
                $('#chat').scrollTop($('#chat').prop("scrollHeight"));

				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-success');
                $('.alert span').text('Person pinged. He/she will receive an email that a question has been asked.');
                $('.alert').show();
                setTimeout(function () {
                    $('.alert').hide();
                }, 3000);
            }
        });
    });

    $('.alert .btn-close').click(function () {
        $('.alert').hide();
    });
});