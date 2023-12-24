$(async () => {
  'use strict';

  const apiUrl = 'api/santa';

  await $.getScript('/santa.js');
  pageLoaded.then(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('registered')) {
      $('#unavailableDiv').show();
      showAlert({ success: 'Registration completed successfully' });
      return;
    }

    $.get(apiUrl, santa => {
      if (santa.year !== new Date().getFullYear() + 1) {
        $('#unavailableDiv').show();
        showAlert(santa, 0);
        return;
      }
      showAlert({ success: 'Click the image to reveal your pair' }, 0);
      $('#topSecretDiv').show();
      $('#topSecretImage').on('click', function() {
        if (santa.imageUploaded) {
          $('#topSecretImage').attr('src', `/profile/api/image?id=${santa._id}`);
        } else {
          $('#topSecretImage').attr('src', '/resources/images/placeholder.png');
        }
        $('#santaName').text(santa.name);
        $('#santaStreet').text(santa.address.street);
        $('#santaCity').text(`${santa.address.postalCode} ${santa.address.city}`);
        $(this).prop('disabled', true);
      });
    });
  });
});
