const apiUrl = 'profile/api';

$(async () => {
  'use strict';

  await $.getScript('/santa.js');

  const searchParams = new URLSearchParams(window.location.search);

  $.get(`${apiUrl}/list?id=${searchParams.get('id')}`, friend => {
    if (friend.error) {
      showAlert(friend);
    } else {
      if (friend.imageUploaded) {
        $('#image').attr('src', `${apiUrl}/image?id=${friend._id}`);
      } else {
        $('#image').attr('src', '/resources/images/placeholder.png');
      }
      $('#name').val(friend.name);
      $('#description').val(friend.description);
      if (friend.description) {
        $('#description').height($('#description')[0].scrollHeight);
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

  $('form').on('submit', function() {
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
    $.post(`${apiUrl}/update`, friend, result => {
      showAlert(result);
    });
    return false;
  });

  // cropping images
  const modalElement = $('#imageCropperModal').get(0);
  const modal = new bootstrap.Modal(modalElement);

  $('#uploadButton').on('click', () => {
    $('#uploadImage').click();
  });

  $('#uploadImage').on('change', function() {
    const file = this.files[0];
    const image = URL.createObjectURL(file);
    modalElement.addEventListener('shown.bs.modal', function(event) {
      showCroppie(image);
    });
    modal.show();
  });

  $('#submitImage').on('click', () => {
    $('#cropper').croppie('result').then(function(croppedImage) {
      $.post(`${apiUrl}/image`, { image: croppedImage }, result => {
        modal.hide();
        showAlert(result);
        $('#image').attr('src', croppedImage);
      });
    });
  });

  function showCroppie(image) {
    $('#cropper').croppie({
      enableExif: true,
      viewport: {
        width: 300,
        height: 300,
        type: 'circle'
      },
      boundary: {
        width: 300,
        height: 300
      },
      url: image
    });
  }
});
