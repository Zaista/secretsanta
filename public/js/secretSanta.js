/* global $ */

$(function() {
  'use strict';

  $.getScript('/js/commons.js');

  $.get('api/santa', santa => {
    if (santa.error) {
      // TODO display error
    } else {
      $('#santaYear').html(santa.year);
      console.log(santa);
      $('#reveal').on('click', function() {
        if (santa.image) {
          $('#santaImage').attr('src', `resources/images/${santa.image}`);
        } else {
          $('#santaImage').attr('src', '/resources/images/old_images/placeholder.png');
        }
        $('#santaName').text(`Name: ${santa.name}`);
        $('#santaAddress').text(`Address: ${santa.address.street}`);
        $(this).prop('disabled', true);
      });
    }
  });
});
