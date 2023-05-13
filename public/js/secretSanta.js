/* global $, getGroupId, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();
  if (groupId) {
    $.get(`api/santa?groupId=${groupId}`, result => {
      if (result.length === 0 || result[0].year !== new Date().getFullYear() + 1) {
        $('#unavailableDiv').show();
        showAlert(false, 'Santa pairs still not drafted for the next year. Ask your group admin to do that now');
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
          $('#santaCity').text(result[0].address.postalCode + " " + result[0].address.city);
          $(this).prop('disabled', true);
        });
      }
    });
  } else {
    showAlert(true, 'You are not part of any group. Create a new one and invite your friends'); // TODO switch to yellow/neutral
  }
});
