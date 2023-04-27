/* global $ */

$(function() {
  'use strict';

  const groupId = JSON.parse(window.localStorage.getItem('group'))._id;

  $.getScript('/js/commons.js');

  $.getJSON(`api/friends?groupId=${groupId}`, result => {
    $.get('modules/friend.html', friendTemplate => {
      $.each(result, (i, userData) => {
        const friendElement = $.parseHTML(friendTemplate);
        $(friendElement).attr('id', userData._id);
        $(friendElement).find('#userId').text(userData._id);
        $(friendElement).find('.card-header').text(userData.name);
        $(friendElement).find('img').attr('src', `/resources/images/old_images/${userData.userId}.jpg`).on('error', function() {
          $(this).attr('src', '/resources/images/old_images/placeholder.png');
        });
        $(friendElement).find('#street').text(userData.address.street);
        $(friendElement).find('#postalCode').text(userData.address.postalCode);
        $(friendElement).find('#city').text(userData.address.city);
        $(friendElement).find('#state').text(userData.address.state);
        $('.friends').append(friendElement);
      });
    }).then(() => {
      // add card background event
      $('.card').hover(function() {
        $(this).addClass('border-danger');
      }, function() {
        $(this).removeClass('border-danger');
      });

      // add card click event
      $('.col.pointer').on('click', function(event) {
        window.location.href = `/friends/${$(this).attr('id')}`;
      });
    });
  });
});
