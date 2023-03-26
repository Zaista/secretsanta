/* global $, setTimeout */

$(function() {
  'use strict';

  $.getScript('/js/commons.js');

  $.get(`/api/friends/${window.location.pathname.replace('/friends/', '')}`, friend => {
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
    $('#userId').val(friend.userId);
  });

  $('form').on('submit', function() {
    const friend = {
      userId: $('#userId').val(),
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
    $.post(`/api/friends/${friend.userId}`, friend, result => {
      $('.alert').removeClass('alert-success alert-danger');
      if (result.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('.alert').addClass('alert-success');
      }
      $('.alert span').text(result.message);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    });
    return false;
  });
});
