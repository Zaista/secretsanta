/* global $, setTimeout */

$(function() {
  'use strict';

  $('#menu').load('views/menu');
  $.get('api/getUserGroups', result => {
    result.forEach(group => {
      $('#groupSelector').append($('<option>', {
          value: group._id,
          text : group.name
      }));
    });
  });
  console.log(window.localStorage.getItem('groupId'))
  const preselectedGroupId = window.localStorage.getItem('groupId');
  if (preselectedGroupId) {
    $('#groupSelector').val(preselectedGroupId);
  } else {
    $('#groupSelector').val($('#groupSelector option:first').val());
  }

  $.get('api/santa', result => {
    if (result.error) {
      $('#santa-display').empty();
      $('#santa-display').append('<div class="alert alert-success">' + result[0].firstName + '</div>');
    } else {
      // TODO
    }
  });

  $('#rematch-form').on('submit', function() {
    const password = $('#rematch-password').val();
    $.getJSON('api/match?password=' + password, function(result) {
      if (result.error) {
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-danger');
        $('.alert span').text(result.error);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
      } else {
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-success');
        $('.alert span').text(result.match);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
        $('#rematch-dialog').modal('hide');
      }
    });
    return false;
  });
});
