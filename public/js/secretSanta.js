/* global $, setTimeout */

$(function() {
  'use strict';

  $.getScript('/js/commons.js');

  $.get('api/santa', result => {
    if (result.error) {
      $('#santa-display').empty();
      $('#santa-display').append('<div class="alert alert-success">' + result[0].firstName + '</div>');
    } else {
      // TODO
    }
  });
});
