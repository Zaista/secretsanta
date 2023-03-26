/* global $, setTimeout */

$(function() {
  'use strict';

  const groupId = JSON.parse(window.localStorage.getItem('group'))._id;

  $.getScript('/js/commons.js');

  $('#emailNotifications').change(onChangeDetector);
  $('#groupNameSettings').on('input', onChangeDetector);

  $.getJSON(`api/users?groupId=${groupId}`, function(result) {
    $.get('modules/user.html', userTemplate => {
      $.each(result, function(index, userData) {
        const userElement = $.parseHTML(userTemplate);
        $(userElement).find('#index').text(++index);
        $(userElement).find('#name').text(userData.name);
        $(userElement).find('#profile').attr('href', `/friends/${userData.userId}`);
        $(userElement).find('#email').text(userData.email);
        $(userElement).find('#role').val(userData.role);
        $(userElement).find('#role').on('input', onChangeDetector);
        if (userData.active) {
          $(userElement).find('#status').attr('checked', true);
        }
        $(userElement).find('#status').on('input', onChangeDetector);
        $('#users tbody').append(userElement);
      });
    });
  });

  $.getJSON(`api/group/${groupId}`, group => {
    $('#groupNameSettings').val(group.name);
    $('#emailNotifications').val(`${group.emailNotifications}`);
  });

  $('#groupForm').on('submit', function() {
    const groupData = {
      name: $('#groupNameSettings').val(),
      emailNotifications: $('#emailNotifications').val()
    }
    $.post(`api/group/${groupId}`, groupData, result => {
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
    const updatedGroup = {
      _id: $('#groupSelector option:selected').val(),
      name: $('#groupNameSettings').val()
    }
    window.localStorage.setItem('group', JSON.stringify(updatedGroup));
    $('#groupName').html(updatedGroup.name);
    return false;
  });

  function onChangeDetector() {
    if ($(this).attr('data-onchange') === 'group' )
      $('#groupButton').removeAttr('disabled');
    else if ($(this).attr('data-onchange') === 'users' )
      $('#userButton').removeAttr('disabled');
  }

  // TODO not working
  $('#emailPasswords').on('click', function() {
    const personId = $('#email-select').val();
    $.getJSON('api/email?person=' + personId, function(result) {
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
        $('.alert span').text(result.success);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
      }
    });
  });

  // TODO not working
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
