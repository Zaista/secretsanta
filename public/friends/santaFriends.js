$(async () => {
  'use strict';

  const apiUrl = 'friends/api';
  const profileApiUrl = 'profile/api';

  await $.getScript('/santa.js');
  pageLoaded.then(async () => {
    const friendTemplate = await $.get('friends/friend.html');

    $.getJSON(`${apiUrl}/list`, (result) => {
      if (result.length === 0) {
        showAlert({ warning: 'No friends to see' });
        return;
      }
      $.each(result, (i, userData) => {
        const friendElement = $.parseHTML(friendTemplate);
        $(friendElement)
          .find('[data-id="name"]')
          .text(userData.name || userData.email);
        if (userData.imageUploaded) {
          lazyLoadImage(userData._id, $(friendElement).find('img')).then(
            (image) => {
              $(friendElement)
                .find('img')
                .attr('src', image.src)
                .removeClass('loading-image');
            }
          );
        } else {
          $(friendElement).find('img').removeClass('loading-image');
        }
        $(friendElement)
          .find('[data-id="street"]')
          .text(userData.address?.street || 'N/A');
        $(friendElement)
          .find('[data-id="postalCode"]')
          .text(userData.address?.postalCode || '(N/A)');
        $(friendElement)
          .find('[data-id="city"]')
          .text(userData.address?.city || 'N/A');
        $(friendElement)
          .find('[data-id="state"]')
          .text(userData.address?.state || 'N/A');
        $(friendElement).on('click', function () {
          window.location.href = `/profile?id=${userData._id}`;
        });
        $('#friendsList').append(friendElement);
      });
    });

    function lazyLoadImage(userId, image) {
      return new Promise(function (resolve) {
        const lazyImage = new Image();
        const imageUrl = `${profileApiUrl}/image?id=${userId}`;
        lazyImage.src = imageUrl;

        lazyImage.onload = () => {
          image.src = imageUrl;
          resolve(image);
        };
      });
    }
  });
});
