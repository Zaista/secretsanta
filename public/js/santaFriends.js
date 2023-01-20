/*global $, document, setTimeout */

$(function () {
    'use strict';

    let users = [];

    $.getJSON('api/friends', function (result) {
        $.each(result, function (i, userData) {
            let santaTemplate = $('#santa-template').html();

            santaTemplate = santaTemplate.replace(/{{user}}/g, userData.username);
            santaTemplate = santaTemplate.replace(/{{index}}/, i);
            $(".friends").append(santaTemplate);
            users.push(userData);
        });
    });

    // if friend sheet is open
    $('#friend').on('show.bs.modal', function (event) {
        let picture = $(event.relatedTarget).data('picture');
        let userId = $(event.relatedTarget).data('index');
        $('#santa_sheet').attr('src', 'resources/images/' + picture);
        let name = users[userId].firstName;
        if (users[userId].lastName) {
            name += ' ' + users[userId].lastName;
        }
        $('#santa_name').html('<b>Name:</b> ' + name);

        if (users[userId].email) {
            $('#santa_email').html('<b>Email:</b> ' + users[userId].email);
        } else {
            $('#santa_email').html('<b>Email:</b> No email set.');
        }

        if (users[userId].address) {
            $('#santa_address').html('<b>Address:</b> ' + users[userId].address);
        } else {
            $('#santa_address').html("<b>Address:</b> No address set.");
        }
    });

    // if friend sheet is closed
    $('#friend').on('hidden.bs.modal', function () {
        $('#santa_sheet').attr('src', '');
    });
});