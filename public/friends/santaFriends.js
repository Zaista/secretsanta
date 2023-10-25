/* global $, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/commons.js');

  $.getJSON('friends/api/list', result => {
    if (result.length !== 0) {
      $.get('modules/friend.html', friendTemplate => {
        $.each(result, (i, userData) => {
          const friendElement = $.parseHTML(friendTemplate);
          $(friendElement).find('#userId').val(userData._id);
          $(friendElement).find('#name').text(userData.name || userData.email);
          if (userData.imageUploaded) {
            $(friendElement).find('img').attr('src', `profile/api/image?_id=${userData._id}`);
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
          window.location.href = `/profile?_id=${$(this).find('#userId').val()}`;
        });
      });
    } else {
      showAlert({ warning: 'No friends to see' });
    }
  });
});
