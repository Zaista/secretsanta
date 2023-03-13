/* global $ */

$(function() {
  'use strict';

  $('#menu').load('views/menu', () => {
    $('#menu-friends').addClass('active');
    $('#menu-friends').attr('aria-current', 'page');
  });

  $.getJSON('api/friends', function(result) {
    $.get('modules/friend.html', friendTemplate => {
      $.each(result, function(i, userData) {
        const friendElement = $.parseHTML(friendTemplate);
        $(friendElement).attr('id', userData.userId);
        $(friendElement).find('#userId').text(userData.userId);
        $(friendElement).find('.card-header').text(userData.name);
        $(friendElement).find('img').attr('src', `resources/images/old_images/${userData.username}.jpg`);
        $(friendElement).find('#street').text(userData.address.street);
        $(friendElement).find('#postalCode').text(userData.address.postalCode);
        $(friendElement).find('#city').text(userData.address.city);
        $(friendElement).find('#state').text(userData.address.state);
        $('.friends').append(friendElement);
      });
    }).then(() => {
      // add card background event
      $('.card').hover(function() {
        $(this).addClass('border-danger');
      }, function() {
        $(this).removeClass('border-danger');
      });

      // add card click event
      $('.col.pointer').on('click', function(event) {
        window.location.href = `/friends/${$(this).attr('id')}`;
      });
    });
  });
});
