/* global $, showAlert */

$(function() {
  'use strict';

  $.getScript('/js/commons.js');

  $.get(`/api${window.location.pathname}`, friend => {
    $('#image').attr('src', `/resources/images/old_images/${friend.userId}.jpg`).on('error', function() {
      $(this).attr('src', '/resources/images/old_images/placeholder.png');
    });
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
      showAlert(!result.error, result.message);
    });
    return false;
  });
});
