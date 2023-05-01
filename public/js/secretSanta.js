/* global $, getGroupId, showAlert */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

  $.get(`api/santa?groupId=${groupId}`, result => {
    if (result.length === 0 || result[0].year !== new Date().getFullYear() + 1) {
      $('#unavailableDiv').show();
      showAlert(false, 'Santa pairs still not drafted for the next year. Ask you group admin to do that now');
    } else {
      $('#topSecretDiv').show();
      $('#topSecretImage').on('click', function() {
        if (result[0]._id) {
          $('#topSecretImage').attr('src', `resources/images/${result[0].image}.png`);
        } else {
          $('#topSecretImage').attr('src', '/resources/images/placeholder.png');
        }
        $('#santaName').text(`Name: ${result[0].name}`);
        $('#santaAddress').text(`Address: ${result[0].address.street}`);
        $(this).prop('disabled', true);
      });
    }
  });
});
