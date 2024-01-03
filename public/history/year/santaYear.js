$(async () => {
  'use strict';

  const apiUrl = 'year/api';
  let uploadEndpoint;
  let imageElement;
  let iconElement;
  let croppie;
  const modal = new bootstrap.Modal('#imageModal');
  const giftTextModal = new bootstrap.Modal('#giftTextModal');
  let giftEditElement;

  const showCroppie = (e) => {
    $('#imagePopup').parent().prop('hidden', true);
    const file = e.currentTarget.files[0];
    const imageUrl = URL.createObjectURL(file);
    initializeCroppie(imageUrl);
    $('#imageEdit').prop('hidden', true);
    $('#imageSubmit').prop('hidden', false);
  };

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
    } else {
      $('#locationIcon').removeClass('loading-image');
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
    $(giftElement).find('#santa').text(gift.santa);
    $(giftElement).find('#child').text(gift.child);
    $(giftElement).find('#giftText').text(gift.gift);

    $(giftElement).find('#giftTextEdit').on('click', () => {
      $('#giftEditInput').attr('data-id', gift.giftId);
      if (gift.gift !== null) {
        $('label[for="giftEditInput"]').text(`Update '${gift.gift}' to:`);
      } else {
        $('label[for="giftEditInput"]').text('Update empty description to:');
      }
      giftEditElement = $(giftElement).find('#giftText');
      giftTextModal.show();
    });

    $(giftElement).find('#giftIcon, #giftImage').on('click', (e) => {
      uploadEndpoint = `gift-image?yearId=${searchParams.get('id')}&giftId=${gift.giftId}`;
      imageElement = $(giftElement).find('#giftImage');
      iconElement = $(giftElement).find('#giftIcon');

      if (e.currentTarget.src === undefined) {
        $('#imagePopup').attr('src', '');
      } else {
        $('#imagePopup').attr('src', e.currentTarget.src);
      }
    });

    $(giftElement).find('#giftImageUpload').on('change', showCroppie);

    if (gift.imageUploaded !== undefined) {
      lazyLoadImage(gift.giftId, $(giftElement).find('#giftImage')).then(image => {
        $(giftElement).find('#giftImage').attr('src', image.src);
        $(giftElement).find('#giftIcon').attr('hidden', true);
        $(giftElement).find('#giftImage').attr('hidden', false);
      });
    } else {
      $(giftElement).find('#giftIcon').removeClass('loading-image');
    }
    $('tbody').append(giftElement);
  }

  $('#imageEdit').on('click', () => {
    $('#imageUpload').click();
  });

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

  $('#locationIcon, #locationImage').on('click', (e) => {
    uploadEndpoint = 'location-image?id=' + searchParams.get('id');
    imageElement = $('#locationImage');
    iconElement = $('#locationIcon');

    if (e.currentTarget.src === undefined) {
      $('#imagePopup').attr('src', '');
    } else {
      $('#imagePopup').attr('src', e.currentTarget.src);
    }
  });

  // cropping images
  $('#imageUpload').on('change', showCroppie);

  $('#imageSubmit').on('click', (e) => {
    $(e.currentTarget).addClass('loading-image');
    showAlert({ 'warning': 'Uploading image, please wait...' }, 0);
    croppie.result({ size: 'original' }).then(croppedImage => {
      $.post(`${apiUrl}/${uploadEndpoint}`, { image: croppedImage }, result => {
        modal.hide();
        $(e.currentTarget).removeClass('loading-image');
        showAlert(result);
        if (result.success) {
          imageElement.attr('src', croppedImage).attr('hidden', false);
          iconElement.attr('hidden', true);
          $('#imagePopup').parent().prop('hidden', false);
          $('#imageEdit').prop('hidden', false);
          $('#imageSubmit').prop('hidden', true);
          $('#cropper').prop('hidden', true);
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
      };
      croppie = new Croppie(croppieElement.get(0), croppieOptions);
    } else {
      $('#cropper').prop('hidden', false);
      croppie.bind({ url: imageUrl });
    }
  }

  const giftEditInput = $('#giftEditInput');
  giftEditInput.on('keypress', (e) => {
    if (e.which === 13) {
      updateGiftDescription();
    }
  });

  $('#giftEditSubmit').on('click', () => {
    updateGiftDescription();
  });

  function updateGiftDescription() {
    $.post(`${apiUrl}/gift-description`, { _id: giftEditInput.attr('data-id'), description: giftEditInput.val() }, result => {
      giftTextModal.hide();
      showAlert(result);
      if (result.success) {
        giftEditElement.text($('#giftEditInput').val());
      }
      giftEditInput.val('');
    });
  }
});
