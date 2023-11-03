/* global $, showAlert */

const apiUrl = 'friends/api'
const profileApiUrl = 'profile/api'

$(async function() {
  'use strict';

  await $.getScript('/santa.js');

  $.getJSON(`${apiUrl}/list`, result => {
    if (result.length !== 0) {
      $.get('friends/friend.html', friendTemplate => {
        $.each(result, (i, userData) => {
          const friendElement = $.parseHTML(friendTemplate);
          $(friendElement).find('#userId').val(userData._id);
          $(friendElement).find('#name').text(userData.name || userData.email);
          if (userData.imageUploaded) {
            lazyLoadImage(userData._id, $(friendElement).find('img')).then(image => {
              $(friendElement).find('img').attr('src', image.src);
            })
          }
          $(friendElement).find('#street').text(userData.address?.street || 'N/A');
          $(friendElement).find('#postalCode').text(userData.address?.postalCode || '(N/A)');
          $(friendElement).find('#city').text(userData.address?.city || 'N/A');
          $(friendElement).find('#state').text(userData.address?.state || 'N/A');
          $('.friends').append(friendElement);
        });
      }).then(() => {
        // add card click event
        $('.card.pointer').on('click', function() {
          window.location.href = `/profile?_id=${$(this).find('#userId').val()}`;
        });
      });
    } else {
      showAlert({ warning: 'No friends to see' });
    }
  });
});

function lazyLoadImage(userId, image) {
  return new Promise(function(resolve) {
    const lazyImage = new Image();
    const imageUrl = `${profileApiUrl}/image?_id=${userId}`;
    lazyImage.src = imageUrl;

    lazyImage.onload = () => {
      image.src = imageUrl;
      resolve(image)
    };
  });
}
