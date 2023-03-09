/* global $ */

$(function () {
  'use strict';

  $('#menu').load('modules/menu.html', () => {
    $('#menu-friends').addClass('active');
    $('#menu-friends').attr('aria-current', 'page');
  });

  const users = [];

  $.getJSON('api/friends', function (result) {
    $.get('modules/friend.html', baseFriendTemplate => {
      $.each(result, function (i, userData) {
        let friendTemplate = baseFriendTemplate;
        friendTemplate = friendTemplate.replace(/{{user}}/g, userData.username);
        friendTemplate = friendTemplate.replace(/{{name}}/g, `${userData.firstName} ${userData.lastName}`);
        const [address, city, state] = userData.address.split(',');
        friendTemplate = friendTemplate.replace(/{{address}}/g, address);
        friendTemplate = friendTemplate.replace(/{{city}}/g, city);
        friendTemplate = friendTemplate.replace(/{{state}}/g, state);
        friendTemplate = friendTemplate.replace(/{{index}}/, i);
        $('.friends').append(friendTemplate);
      });
    });
  });

  // if friend sheet is open
  $('#friend').on('show.bs.modal', function (event) {
    const picture = $(event.relatedTarget).data('picture');
    const userId = $(event.relatedTarget).data('index');
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
      $('#santa_address').html('<b>Address:</b> No address set.');
    }
  });

  // if friend sheet is closed
  $('#friend').on('hidden.bs.modal', function () {
    $('#santa_sheet').attr('src', '');
  });
});
