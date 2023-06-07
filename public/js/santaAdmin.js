/* global $, bootstrap, showAlert, getGroupId */

$(async function() {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

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
      };
      usersRoleAndStatus.push(userData);
    });
    $.post(`api/users?groupId=${groupId}`, { usersRoleAndStatus }, result => {
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
    };
    $.post(`api/group/${groupId}`, groupData, result => {
      showAlert(!result.error, result.message);
    });
    const updatedGroup = {
      _id: $('#groupSelector option:selected').val(),
      name: $('#groupNameSettings').val()
    };
    window.localStorage.setItem('group', JSON.stringify(updatedGroup));
    $('#groupName').html(updatedGroup.name);
    return false;
  });

  // fill up the forbiddenPair table with forbidden pairs
  $.getJSON(`api/forbidden?groupId=${groupId}`, function(result) {
    // TODO make this beautiful
    result.forEach((pair, index) => {
      $('#forbiddenPairsTable tbody').append(`<tr><td><b>${++index}</b></td><td class="pairColumn1">${pair.forbiddenPair1}</td><td>${pair.forbiddenPair2}</td><td><i class="buttonDelete bi bi-trash" style='color:red'></i></td></tr>`);
    });
    $('.buttonDelete').on('click', function ()  {
        const pair = {
              forbiddenUser1: $('#forbiddenUser1').val(),
              forbiddenUser2: $('#forbiddenUser2').val()
            };
            $.post(`api/remove`, { forbiddenPairId: $(this).parents('.pairColumn1').html() }, result => {
                  showAlert(true, result.success);
                  // TODO reload page or add item to the table manually, close modal
                });
                return false;
        });
  });

  // fill up the forbiddenPair modal select elements with usernames
  $.getJSON(`api/friends?groupId=${groupId}`, function(result) {
    result.forEach(function(friend) {
      $('#forbiddenUser1, #forbiddenUser2').append(`<option value="${friend._id}" data-email="${friend.email}">${friend.name}</option>`);
    });
  });

  $('#forbiddenPairsForm').on('submit', () => {
    const pair = {
      forbiddenUser1: $('#forbiddenUser1').val(),
      forbiddenUser2: $('#forbiddenUser2').val()
    };
    $.post(`api/forbidden?groupId=${groupId}`, pair, result => {
      showAlert(true, result.success);
      // TODO reload page or add item to the table manually, close modal
    });
    return false;
  });


  $('#newUsersForm').on('submit', () => {
    const newUser = {
      email: $('#newUserEmail').val(),
      groupId: groupId
    };
    $.post('api/user', newUser, result => {
      showAlert(true, result.success);
      // TODO reload page or add item to the table manually, close modal
    });
    const modal = $('#newUsersModal');
    bootstrap.Modal.getInstance(modal).hide();
    return false;
  });

  $.getJSON(`api/draft?groupId=${groupId}`, response => {
    if (response.success)
      $('#draft').removeAttr('disabled');
  });

  $('#draft').on('click', function() {
    $.ajax({
      url: `api/draft?groupId=${groupId}`,
      method: 'PUT',
      success: result => {
        if (result.success) {
          showAlert(true, result.success);
          $(this).prop('disabled', true);
        } else {
          showAlert(false, result.error);
        }
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

  // TODO not working
  $('#emailPasswords').on('click', function() {
    const personId = $('#email-select').val();
    $.getJSON('api/email?person=' + personId, function(result) {
      if (result.error) {
        showAlert(false, result.error);
      } else {
        showAlert(true, result.error);
      }
    });
  });
});
