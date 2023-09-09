/* global $ */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  $.getJSON('api/friends', result => {
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
        $(friendElement).find('#street').text(userData.address?.street || 'N/A');
        $(friendElement).find('#postalCode').text(userData.address?.postalCode || '(N/A)');
        $(friendElement).find('#city').text(userData.address?.city || 'N/A');
        $(friendElement).find('#state').text(userData.address?.state || 'N/A');
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
