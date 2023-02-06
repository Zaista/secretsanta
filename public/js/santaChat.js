/*global $, document, setTimeout */

$(function () {
    'use strict';

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    $.getJSON('api/chat', function (result) {
        for (let message of result) {
            let date = new Date(message.timestamp);

            let hours = date.getHours();
            hours = hours < 10 ? '0' + hours : hours;

            let minutes = date.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;

            let dateStr = hours + ':' + minutes + ' - ' + date.getDate() + '. ' + months[date.getMonth()];
            $('#chat').append('<p>' + message.message + '<span>@' + message.firstName + ' (' + dateStr + ')' + '</span></p>');
        }

        $('#chat').scrollTop($('#chat').prop('scrollHeight'));
    });

    $('#chat-form').on('submit', function () {

        let requestData = $(this).serialize();

        $.post('api/chat', requestData, function (data) {
            let result = JSON.parse(data);
            console.log(result);
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
                $('#chat').scrollTop($('#chat').prop('scrollHeight'));

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

    $('.alert .btn-close').on('click', function () {
        $('.alert').hide();
    });
});