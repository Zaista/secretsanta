$(async () => {
  'use strict';

  const apiUrl = 'api/santa';

  await $.getScript('/santa.js');
  pageLoaded.then(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('registered')) {
      $('#unavailableDiv').prop('hidden', false);
      showAlert({ success: 'Registration completed successfully' });
      return;
    }

    $.get(apiUrl, (santa) => {
      if (santa.year !== new Date().getFullYear() + 1) {
        $('#unavailableDiv').prop('hidden', false);
        showAlert(santa, 0);
        return;
      }
      showAlert({ success: 'Click the image to reveal your pair' }, 0);
      $('#topSecretDiv').prop('hidden', false);
      const topSecretImage = $('#topSecretImage');
      topSecretImage.on('click', () => {
        topSecretImage.addClass('loading-image');
        if (santa.imageUploaded) {
          lazyLoadImage(santa._id, topSecretImage).then((image) => {
            topSecretImage.attr('src', image.src).removeClass('loading-image');

            // show santa data only after image is shown
            $('#santaName').text(santa.name);
            $('#santaEmail').text(santa.email);
            $('#santaStreet').text(santa.address.street);
            $('#santaCity').text(
              `${santa.address.postalCode} ${santa.address.city}`
            );
          });
        } else {
          topSecretImage
            .attr('src', '/resources/images/placeholder.png')
            .removeClass('loading-image');
          $('#santaName').text(santa.name);
          $('#santaEmail').text(santa.email);
          $('#santaStreet').text(santa.address.street);
          $('#santaCity').text(
            `${santa.address.postalCode} ${santa.address.city}`
          );
        }
        topSecretImage.off('click');
      });
    });

    function lazyLoadImage(userId, image) {
      return new Promise(function (resolve) {
        const lazyImage = new Image();
        const imageUrl = `profile/api/image?id=${userId}`;
        lazyImage.src = imageUrl;

        lazyImage.onload = () => {
          image.src = imageUrl;
          resolve(image);
        };
      });
    }
  });
});
