/*global $, document, setTimeout */

$(document).ready(function () {
    "use strict";

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    $.getJSON('api/chat', function (result) {
        for (var message of result) {
            var date = new Date(message.Timestamp);

            var hours = date.getHours();
            hours = hours < 10 ? '0' + hours : hours;

            var minutes = date.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;

            var dateStr = hours + ":" + minutes + " - " + date.getDate() + ". " + months[date.getMonth()];
            $('#chat').append('<p>' + message.Message + '<span>@' + message.FirstName + ' (' + dateStr + ')' + '</span></p>');
        }

        $('#chat').scrollTop($('#chat').prop("scrollHeight"));
    });

    $('#chat-form').submit(function () {

        var requestData = $(this).serialize();

        $.post('api/chat', requestData, function (data) {
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
                $('#chat').append('<p>' + result.message + '<span>Just now...</span></p>');
                $('#chat').scrollTop($('#chat').prop("scrollHeight"));

                $('.alert').removeClass('alert-success alert-danger');
                $('.alert').addClass('alert-success');
                $('.alert span').text(result.result);
                $('.alert').show();
                setTimeout(function () {
                    $('.alert').hide();
                }, 3000);
            }
        });

        return false;
    });

    $('.alert .btn-close').click(function () {
        $('.alert').hide();
    });
});