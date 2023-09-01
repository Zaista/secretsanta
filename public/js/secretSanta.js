/* global $, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  $.get('api/santa', result => {
    if (result.length === 0 || result[0].year !== new Date().getFullYear() + 1) {
      $('#unavailableDiv').show();
      showAlert({ warning: 'Santa pairs still not drafted for the next year. Ask your group admin to do that now' });
    } else {
      $('#topSecretDiv').show();
      $('#topSecretImage').on('click', function() {
        if (result[0].image) {
          $('#topSecretImage').attr('src', `resources/images/${result[0].image}.png`);
        } else {
          $('#topSecretImage').attr('src', '/resources/images/placeholder.png');
        }
        $('#santaName').text(result[0].name);
        $('#santaStreet').text(result[0].address.street);
        $('#santaCity').text(result[0].address.postalCode + ' ' + result[0].address.city);
        $(this).prop('disabled', true);
      });
    }
  });
});
