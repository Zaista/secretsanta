/* global $, bootstrap, showAlert */

$(async () => {
  'use strict';

  await $.getScript('/js/commons.js');
  
  let searchParams = new URLSearchParams(window.location.search);

  $.get(`/api/friends/friend?_id=${searchParams.get('_id')}`, friend => {
    $('#image').attr('src', `/api/friends/friend/image?_id=${friend._id}`);
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
    $('#userId').val(friend._id);
  });

  $('form').on('submit', function() {
    const friend = {
      _id: $('#userId').val(),
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
    $.post(`/api/friends/${friend._id}`, friend, result => {
      showAlert(result);
    });
    return false;
  });
  
  // cropping images
  const modalElement = $('#imageCropperModal').get(0)
  const modal = new bootstrap.Modal(modalElement);
  
  $('#uploadButton').on('click', () => {
    $('#uploadImage').click();
  });
  
  $('#uploadImage').on('change', function () {
    const file = this.files[0]
    let image = URL.createObjectURL(file)
    modalElement.addEventListener('shown.bs.modal', function (event) {
      showCroppie(image);
    })
    modal.show();
  })
  
  $('#submitImage').on('click', () => {
    $('#cropper').croppie('result').then(function(croppedImage) {
      $.post('/api/profile/image', { image: croppedImage }, (result) => {
        showAlert(result);
        modal.hide();
        // TODO reload the image or the page
      })
    });
  });

  function showCroppie(image) {
    $('#cropper').croppie({
      enableExif: true,
      viewport: {
        width: 200,
        height: 200,
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
