/* global $, setTimeout */

$(function() {
  'use strict';

  const groupId = JSON.parse(window.localStorage.getItem('group'))._id;

  $.getScript('/js/commons.js');

  $('#emailNotifications').on('change', onChangeDetector);
  $('#groupNameSettings').on('input', onChangeDetector);

  $.getJSON(`api/users?groupId=${groupId}`, function(result) {
    $.get('modules/user.html', userTemplate => {
      $.each(result, function(index, userData) {
        const userElement = $.parseHTML(userTemplate);
        $(userElement).find('[name="userIndex"]').text(++index);
        $(userElement).find('[name="userName"]').text(userData.name);
        $(userElement).find('a').attr('href', `/friends/${userData._id}`);
        $(userElement).find('[name="userId"]').val(userData._id);
        $(userElement).find('[name="userEmail"]').text(userData.email);
        $(userElement).find('[name="userRole"]').val(userData.role);
        $(userElement).find('[name="userRole"]').on('input', onChangeDetector);
        if (userData.active) {
          $(userElement).find('[name="userStatus"]').attr('checked', true);
        }
        $(userElement).find('[name="userStatus"]').on('input', onChangeDetector);
        $('#users tbody').append(userElement);
      });
    });
  });

  $('#userButton').on('click', () => {
    const usersRoleAndStatus = [];
    $('tr[name="userRow"]').each(function() {
      const userData = {
        _id: $(this).find('[name="userId"]').val(),
        role: $(this).find(':selected').val(),
        active: $(this).find('[name="userStatus"]').is(':checked')
      }
      usersRoleAndStatus.push(userData);
    });
    $.post(`api/users?groupId=${groupId}`, { usersRoleAndStatus: usersRoleAndStatus }, result => {
      showAlert(true, result.success);
      $('#userButton').prop('disabled', true);
    });
    return false;
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
      showAlert(!result.error, result.message);
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
        showAlert(true, result.error);
      }
    });
  });

  // TODO not working
  $('#rematch-form').on('submit', function() {
    const password = $('#rematch-password').val();
    $.getJSON('api/match?password=' + password, function(result) {
      if (result.error) {
        showAlert(false, result.error);
      } else {
        showAlert(true, result.match);
        $('#rematch-dialog').modal('hide');
      }
    });
    return false;
  });
});
