$(async () => {
  'use strict';

  const apiUrl = 'year/api';
  let uploadEndpoint;
  let imageElement;
  let iconElement;
  let croppie;
  const modalElement = $('#imageCropperModal').get(0);
  const modal = new bootstrap.Modal(modalElement);

  const showCroppie = (e) => {
    const file = e.currentTarget.files[0];
    const imageUrl = URL.createObjectURL(file);
    modalElement.addEventListener('shown.bs.modal', () => {
      initializeCroppie(imageUrl);
    });
    modal.show();
  }

  await $.getScript('/santa.js');
  const giftTemplate = await $.get('year/gift.html');

  const searchParams = new URLSearchParams(window.location.search);

  $.getJSON(`${apiUrl}/gifts?id=${searchParams.get('id')}`, year => {
    $('#yearTitle').text(year.year);
    if (year.imageUploaded) {
      lazyLoadImage(year._id, $('#locationImage')).then(image => {
        $('#locationImage').attr('src', image.src).attr('hidden', false);
        $('#locationIcon').attr('hidden', true);
      });
    }

    if (year.gifts.length === 0) {
      showAlert({ warning: 'No gifts' });
      return;
    }
    year.gifts.forEach(gift => {
      listGifts(gift);
    });
  });

  function listGifts(gift) {
    const giftElement = $.parseHTML(giftTemplate);
    $(giftElement).find('#gift').text(gift.gift);
    $(giftElement).find('#santa').text(gift.santa);
    $(giftElement).find('#child').text(gift.child);
    $(giftElement).find('#giftIcon, #giftImage').on('click', (e) => {
      uploadEndpoint = `gift-image?yearId=${searchParams.get('id')}&giftId=${gift.giftId}`;
      imageElement = $(giftElement).find('#giftImage');
      iconElement = $(giftElement).find('#giftIcon');
      $('#imageUpload').click();
    });

    $(giftElement).find('#giftImageUpload').on('change', showCroppie);

    if (gift.imageUploaded !== undefined) {
      lazyLoadImage(gift.giftId, $(giftElement).find('#giftImage')).then(image => {
        $(giftElement).find('#giftImage').attr('src', image.src);
        $(giftElement).find('#giftIcon').attr('hidden', true);
        $(giftElement).find('#giftImage').attr('hidden', false);
      });
    }
    $('tbody').append(giftElement);
  }

  function lazyLoadImage(yearId, image) {
    return new Promise(function(resolve) {
      const lazyImage = new Image();
      const imageUrl = `${apiUrl}/location-image?id=${yearId}`;
      lazyImage.src = imageUrl;

      lazyImage.onload = () => {
        image.src = imageUrl;
        resolve(image);
      };
    });
  }

  $('#locationIcon, #locationImage').on('click', () => {
    uploadEndpoint = 'location-image?id=' + searchParams.get('id');
    imageElement = $('#locationImage');
    iconElement = $('#locationIcon');
    $('#imageUpload').click();
  });

  // cropping images
  $('#imageUpload').on('change', showCroppie);

  $('#imageSubmit').on('click', () => {
    croppie.result().then(croppedImage => {
      $.post(`${apiUrl}/${uploadEndpoint}`, {image: croppedImage}, result => {
        modal.hide();
        showAlert(result);
        if (result.success) {
          imageElement.attr('src', croppedImage).attr('hidden', false);
          iconElement.attr('hidden', true);
        }
      });
    });
  });

  function initializeCroppie(imageUrl) {
    if (croppie === undefined) {
      const croppieElement = $('#cropper');
      const croppieOptions = {
        enableExif: true,
        enableResize: true,
        viewport: {
          width: croppieElement.width() - 50,
          height: croppieElement.width() - 50
        },
        boundary: {
          width: croppieElement.width(),
          height: croppieElement.width()
        },
        url: imageUrl
      }
      croppie = new Croppie(croppieElement.get(0), croppieOptions);
    } else {
      croppie.bind({ url: imageUrl })
      // TODO bug: croppie boundaries get screwed up
    }
  }

  // TODO no used: if present picture is open
  $('#present').on('show.bs.modal', function(event) {
    const picture = $(event.relatedTarget).data('picture');
    $('#image').attr('src', 'resources/images/' + picture);
  });
});
