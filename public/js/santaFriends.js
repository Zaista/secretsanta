/* global $, getGroupId, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

  if (groupId) {
    $.getJSON(`api/friends?groupId=${groupId}`, result => {
      $.get('modules/friend.html', friendTemplate => {
        $.each(result, (i, userData) => {
          const friendElement = $.parseHTML(friendTemplate);
          $(friendElement).find('#userId').val(userData._id);
          $(friendElement).find('#name').text(userData.name || userData.email);
          if (userData.image) {
            $(friendElement).find('img').attr('src', `/resources/images/${userData.image}.png`);
          } else {
            $(friendElement).find('img').attr('src', '/resources/images/placeholder.png');
          }
          $(friendElement).find('#street').text(userData.address?.street || 'not set');
          $(friendElement).find('#postalCode').text(userData.address?.postalCode || '(not set)');
          $(friendElement).find('#city').text(userData.address?.city || 'not set');
          $(friendElement).find('#state').text(userData.address?.state || 'not set');
          $('.friends').append(friendElement);
        });
      }).then(() => {
        // add card click event
        $('.card.pointer').on('click', function(event) {
          window.location.href = `/friends/${$(this).find('#userId').val()}`;
        });
      });
    });
  } else {
    showAlert(true, 'No group found'); // TODO switch to yellow/neutral
  }
});
