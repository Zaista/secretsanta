/* global $, getGroupId */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

  $.getJSON(`api/friends?groupId=${groupId}`, result => {
    $.get('modules/friend.html', friendTemplate => {
      $.each(result, (i, userData) => {
        const friendElement = $.parseHTML(friendTemplate);
        $(friendElement).find('#userId').val(userData._id);
        $(friendElement).find('#name').text(userData.name);
        $(friendElement).find('img').attr('src', `/resources/images/${userData.userId}.png`).on('error', function() {
          $(this).attr('src', '/resources/images/old_images/placeholder.png');
        });
        $(friendElement).find('#street').text(userData.address.street);
        $(friendElement).find('#postalCode').text(userData.address.postalCode);
        $(friendElement).find('#city').text(userData.address.city);
        $(friendElement).find('#state').text(userData.address.state);
        $('.friends').append(friendElement);
      });
    }).then(() => {
      // add card click event
      $('.card.pointer').on('click', function(event) {
        window.location.href = `/friends/${$(this).find('#userId').val()}`;
      });
    });
  });
});
