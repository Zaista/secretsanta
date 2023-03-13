/* global $, setTimeout */

$(function() {
  'use strict';

  $('#menu').load('/views/menu', () => {
    $('#menu-friends').addClass('active');
    $('#menu-friends').attr('aria-current', 'page');
  });

  $.get(`/api/friends/${window.location.pathname.replace('/friends/', '')}`, friend => {
    $('#image').attr('src', `/resources/images/old_images/${friend.username}.jpg`);
    $('#name').val(`${friend.firstName} ${friend.lastName}`);
    $('#description').val(friend.description);
    if (friend.description) {
      $('#description').height($('#description')[0].scrollHeight);
    }
    $('#street').val(friend.address.street);
    $('#postalCode').val(friend.address.postalCode);
    $('#city').val(friend.address.city);
    $('#state').val(friend.address.state);
    $('#email').val(friend.email);
    $('#role').val(friend.role);
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
      email: $('#email').val(),
      role: $('#role').val()
    };
    $.post(`/api/friends/${friend.userId}`, friend, result => {
      console.log(result);
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
