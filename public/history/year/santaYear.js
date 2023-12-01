$(async () => {
  'use strict';

  const apiUrl = 'year/api';

  await $.getScript('/santa.js');
  const giftTemplate = await $.get('year/gift.html');

  const searchParams = new URLSearchParams(window.location.search);

  $.getJSON(`${apiUrl}/gifts?_id=${searchParams.get('_id')}`, year => {
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
    if (gift.imageUploaded !== undefined) { // TODO gift_image
      lazyLoadImage(gift._id, $(giftElement).find('img')).then(image => {
        $(giftElement).find('img').attr('src', image.src);
        // $(giftElement).find('#giftIcon').attr('hidden', true);
        // $(giftElement).find('#giftImage').attr('hidden', false);
      });
    }
    $('tbody').append(giftElement);
  }

  function lazyLoadImage(yearId, image) {
    return new Promise(function(resolve) {
      const lazyImage = new Image();
      const imageUrl = `${apiUrl}/location-image?_id=${yearId}`;
      lazyImage.src = imageUrl;

      lazyImage.onload = () => {
        image.src = imageUrl;
        resolve(image);
      };
    });
  }
  
  $('#locationIcon').on('click', () => {
    $('#locationImageUpload').click();
  });
  
  // cropping images
  const modalElement = $('#imageCropperModal').get(0);
  const modal = new bootstrap.Modal(modalElement);
  $('#locationImageUpload').on('change', function() {
    const file = this.files[0];
    const image = URL.createObjectURL(file);
    modalElement.addEventListener('shown.bs.modal', function(event) {
      showCroppie(image);
    });
    modal.show();
  });

  $('#locationImageSubmit').on('click', () => {
    $('#cropper').croppie('result').then(croppedImage => {
      $.post(`${apiUrl}/location-image?_id=${searchParams.get('_id')}`, { image: croppedImage }, result => {
        modal.hide();
        showAlert(result);
        $('#locationImage').attr('src', croppedImage).attr('hidden', false);
        $('#locationIcon').attr('hidden', true);
      });
    });
  });

  function showCroppie(image) {
    $('#cropper').croppie({
      enableExif: true,
      viewport: {
        width: 300,
        height: 300
      },
      boundary: {
        width: 300,
        height: 300
      },
      url: image
    });
  }

  // if present picture is open
  $('#present').on('show.bs.modal', function(event) {
    const picture = $(event.relatedTarget).data('picture');
    $('#image').attr('src', 'resources/images/' + picture);
  });
});
