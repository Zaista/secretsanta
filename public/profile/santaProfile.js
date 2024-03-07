const apiUrl = 'profile/api';

$(async () => {
  'use strict';

  await $.getScript('/santa.js');

  let croppie;
  const searchParams = new URLSearchParams(window.location.search);

  $.get(`${apiUrl}/list?id=${searchParams.get('id')}`, friend => {
    if (friend.error) {
      showAlert(friend);
    } else {
      if (friend.imageUploaded) {
        lazyLoadImage(friend._id, $('#image')).then(image => {
          $('#image').attr('src', image.src).removeClass('loading-image');
        });
      } else {
        $('#image').removeClass('loading-image');
      }
      $('#name').val(friend.name);
      const description = $('#description');
      description.val(friend.description);
      if (friend.description) {
        description.height(description[0].scrollHeight);
      }
      if (friend.address) {
        $('#street').val(friend.address.street);
        $('#postalCode').val(friend.address.postalCode);
        $('#city').val(friend.address.city);
        $('#state').val(friend.address.state);
      }
      $('#email').val(friend.email);
    }
  });

  $('#profileSaveButton').on('click', function() {
    const friend = {
      name: $('#name').val(),
      description: $('#description').val(),
      address: {
        street: $('#street').val(),
        postalCode: $('#postalCode').val(),
        city: $('#city').val(),
        state: $('#state').val()
      },
      email: $('#email').val()
    };
    let updateUrl = `${apiUrl}/update`;
    if (searchParams.has('id')) {
      updateUrl += `?id=${searchParams.get('id')}`;
    }
    $.ajax({
      url: updateUrl,
      type: 'POST',
      data: JSON.stringify(friend),
      contentType: 'application/json',
      success: result => {
        showAlert(result);
      }
    });
    return false;
  });

  // cropping images
  const modal = new bootstrap.Modal('#imageModal');
  $('#imageModal').on('shown.bs.modal', (e) => {
    showCroppie(e.relatedTarget);
  });

  $('#image.pointer').on('click', () => {
    $('#uploadImage').click();
  });

  $('#uploadImage').on('change', function() {
    const file = this.files[0];
    const image = URL.createObjectURL(file);
    modal.show(image);
  });

  $('#submitImage').on('click', () => {
    croppie.result({ size: 'original' }).then(function(croppedImage) {
      let updateImageUrl = `${apiUrl}/image`;
      if (searchParams.has('id')) {
        updateImageUrl += `?id=${searchParams.get('id')}`;
      }
      $.post(updateImageUrl, { image: croppedImage }, result => {
        modal.hide();
        showAlert(result);
        $('#image').attr('src', croppedImage);
      });
    });
  });

  function showCroppie(imageUrl) {
    if (croppie === undefined) {
      const croppieElement = $('#cropper');
      const croppieOptions = {
        enableExif: true,
        viewport: {
          width: croppieElement.width() - 50,
          height: croppieElement.width() - 50,
          type: 'circle'
        },
        boundary: {
          width: croppieElement.width(),
          height: croppieElement.width()
        },
        url: imageUrl
      };
      croppie = new Croppie(croppieElement.get(0), croppieOptions);
    } else {
      croppie.bind({ url: imageUrl });
    }
  }

  function lazyLoadImage(userId, image) {
    return new Promise(function(resolve) {
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
