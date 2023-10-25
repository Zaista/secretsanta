/* global $, bootstrap, showAlert */

const apiUrl = 'admin/api';

$(async () => {
  'use strict';

  await $.getScript('/commons.js');

  $('#emailNotifications').on('change', onChangeDetector);
  $('#groupNameSettings').on('input', onChangeDetector);

  $.getJSON(`${apiUrl}/users`, function(result) {
    $.get('modules/user.html', userTemplate => {
      $.each(result, function(index, userData) {
        const userElement = $.parseHTML(userTemplate);
        $(userElement).find('[name="userIndex"]').text(++index);
        $(userElement).find('[name="userName"]').text(userData.name);
        $(userElement).find('a').attr('href', `/friends/${userData._id}`);
        $(userElement).find('[name="userId"]').val(userData._id);
        $(userElement).find('[name="userEmail"]').text(userData.email);
        $(userElement).find('[name="userRole"]').val(userData.groups.role);
        $(userElement).find('[name="userRole"]').on('input', onChangeDetector);

        $(userElement).find('[name="userDelete"]').on('click', () => {
          $.post(`${apiUrl}/user/delete`, { _id: userData._id, email: userData.email }, response => {
            showAlert(response);
            if (response.success) {
              $(userElement).remove();
            }
          });
        });
        $('#users tbody').append(userElement);
      });
    });
  });

  $('#userButton').on('click', () => {
    const usersRoles = [];
    $('tr[name="userRow"]').each(function() {
      const userData = {
        _id: $(this).find('[name="userId"]').val(),
        role: $(this).find(':selected').val()
      };
      usersRoles.push(userData);
    });
    $.post(`${apiUrl}/users`, { usersRoles }, result => {
      showAlert(result);
      $('#userButton').prop('disabled', true);
    });
    return false;
  });

  $.getJSON(`${apiUrl}/group`, group => {
    $('#groupNameSettings').val(group.name);
    $('#emailNotifications').val(`${group.emailNotifications}`);
  });

  $('#groupForm').on('submit', function() {
    const groupData = {
      name: $('#groupNameSettings').val(),
      emailNotifications: $('#emailNotifications').val()
    };
    $.post(`${apiUrl}/group`, groupData, result => {
      showAlert(result);
      if (result.success) {
        $('#groupName').html($('#groupNameSettings').val());
      }
    });
    return false;
  });

  // fill up the forbiddenPair table with forbidden pairs
  $.getJSON(`${apiUrl}/forbidden`, function(result) {
    $.get('modules/pair.html', pairTemplate => {
      result.forEach((pair, index) => {
        const pairElement = $.parseHTML(pairTemplate);
        $(pairElement).find('[data-name="pairIndex"]').text(++index);
        $(pairElement).find('[data-name="pairUser"]').text(pair.user);
        $(pairElement).find('[data-name="pairForbiddenPair"]').text(pair.forbiddenPair);

        $(pairElement).find('[data-name="pairDelete"]').on('click', () => {
          $.post(`${apiUrl}/forbidden/delete`, { _id: pair._id }, result => {
            showAlert(result);
            if (result.success) {
              $(pairElement).remove();
            }
          });
        });
        $('#forbiddenPairsTable tbody').append(pairElement);
      });
    });
  });

  // fill up the forbiddenPair modal select elements with usernames
  $.getJSON('/friends/api/list', function(result) {
    result.forEach(function(friend) {
      $('#forbiddenUser1, #forbiddenUser2').append(`<option value="${friend._id}" data-email="${friend.email}">${friend.name}</option>`);
    });
  });
  $('#forbiddenPairsForm').on('submit', () => {
    const pair = {
      forbiddenUser1Id: $('#forbiddenUser1').val(),
      forbiddenUser2Id: $('#forbiddenUser2').val()
    };
    $.post(`${apiUrl}/forbidden`, pair, result => {
      showAlert(result);
      const rowIndex = $('#forbiddenPairsTable tr').length;
      // TODO after adding try delete last pair
      if (result.success) $('#forbiddenPairsTable > tbody:last-child').append(`<tr value="${result.id}"><td><b>${rowIndex}</b></td><td>${$('#forbiddenUser1 option:selected').text()}</td></td><td>${$('#forbiddenUser2 option:selected').text()}</td><td><i class="buttonDelete bi bi-trash" style="cursor:pointer; color:red"></i></td></td></tr>`);
      const modal = $('#forbiddenPairsModal');
      bootstrap.Modal.getInstance(modal).hide();
      // TODO reload page or add item to the table manually
    });
    return false;
  });

  $('#newUsersForm').on('submit', () => {
    const newUser = {
      email: $('#newUserEmail').val()
    };
    $.post(`${apiUrl}/user`, newUser, result => {
      showAlert(result);
      // TODO reload page or add item to the table manually, close modal
    });
    const modal = $('#newUsersModal');
    bootstrap.Modal.getInstance(modal).hide();
    return false;
  });

  $.getJSON(`${apiUrl}/draft`, response => {
    if (response.success) {
      $('#yearAlert').text(`Santa pairs for year ${new Date().getFullYear() + 1} were not drafted yet`);
      $('#draft').removeAttr('disabled');
    } else {
      $('#yearAlert').text(`Santa pairs for year ${new Date().getFullYear() + 1} were already drafted`);
    }
  });

  $.getJSON(`${apiUrl}/reveal`, response => {
    if (response.success) {
      $('#reveal').removeAttr('disabled');
      $('#yearAlert').append(' but the pairs were not yet revealed');
    }
  });

  $('#draft').on('click', function() {
    $.ajax({
      url: `${apiUrl}/draft`,
      method: 'PUT',
      success: result => {
        if (result.success) {
          $(this).prop('disabled', true);
        }
        showAlert(result);
      }
    });
    return false;
  });

  $('#reveal').on('click', function() {
    $.ajax({
      url: `${apiUrl}/reveal`,
      method: 'PUT',
      success: result => {
        if (result.success) {
          $(this).prop('disabled', true);
        }
        showAlert(result);
      }
    });
    return false;
  });

  function onChangeDetector() {
    if ($(this).attr('data-onchange') === 'group') {
      $('#groupButton').removeAttr('disabled');
    } else if ($(this).attr('data-onchange') === 'users') {
      $('#userButton').removeAttr('disabled');
    }
  }
});
