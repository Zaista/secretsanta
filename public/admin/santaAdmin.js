const apiUrl = 'admin/api';

$(async () => {
  'use strict';

  let userId;
  let userEmail;
  let userEl;
  let pairId;
  let pairEl;

  await $.getScript('/santa.js');
  pageLoaded.then(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('group-created')) {
      $('#unavailableDiv').show();
      showAlert({ success: 'New group created successfully' });
    }

    $('#userAddedNotification').on('change', onChangeDetector);
    $('#messageSentNotification').on('change', onChangeDetector);
    $('#yearDraftedNotification').on('change', onChangeDetector);
    $('#groupNameSettings').on('input', onChangeDetector);

    $.getJSON(`${apiUrl}/users`, function(result) {
      $.get('admin/user.html', userTemplate => {
        $.each(result, function(index, userData) {
          const userElement = $.parseHTML(userTemplate);
          $(userElement).find('[data-name="userIndex"]').text(++index);
          $(userElement).find('[data-name="userEmail"]').text(userData.email);
          $(userElement).find('a').attr('href', `/profile?id=${userData._id}`);
          $(userElement).find('[data-name="userId"]').val(userData._id);
          $(userElement).find('[data-name="userRole"]').val(userData.groups.role);
          $(userElement).find('[data-name="userRole"]').on('input', onChangeDetector);

          $(userElement).find('[data-name="userRemove"]').on('click', () => {
            $('#removeUserDialog').prop('hidden', false);
            $('#deletePairDialog').prop('hidden', true);
            userId = userData._id;
            userEmail = userData.email;
            userEl = userElement;
          });
          $('#users tbody').append(userElement);
        });
      });
    });

    $('#userButton').on('click', (e) => {
      const usersRoles = [];
      $('tr[data-name="userRow"]').each(function() {
        const userData = {
          _id: $(this).find('[data-name="userId"]').val(),
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
      $('#userAddedNotification').prop('checked', group.userAddedNotification);
      $('#messageSentNotification').prop('checked', group.messageSentNotification);
      $('#yearDraftedNotification').prop('checked', group.yearDraftedNotification);
    });

    $('#groupButton').on('click', function() {
      const groupData = {
        name: $('#groupNameSettings').val(),
        userAddedNotification: $('#userAddedNotification').prop('checked'),
        messageSentNotification: $('#messageSentNotification').prop('checked'),
        yearDraftedNotification: $('#yearDraftedNotification').prop('checked')
      };
      $.ajax({
        url: `${apiUrl}/group`,
        type: 'POST',
        data: JSON.stringify(groupData),
        contentType: 'application/json',
        success: result => {
          showAlert(result);
          if (result.success) {
            $('#groupName').html($('#groupNameSettings').val());
          }
        }
      });
      return false;
    });

    // fill up the forbiddenPair table with forbidden pairs
    $.getJSON(`${apiUrl}/forbidden`, function(result) {
      $.get('admin/pair.html', pairTemplate => {
        result.forEach((pair, index) => {
          const pairElement = $.parseHTML(pairTemplate);
          $(pairElement).find('[data-name="pairIndex"]').text(++index);
          let santaName = pair.user;
          if (pair.user === undefined || pair.user === '') { santaName = pair.userEmail; }
          $(pairElement).find('[data-name="pairUser"]').text(santaName);
          let childName = pair.forbiddenPair;
          if (pair.forbiddenPair === undefined || pair.forbiddenPair === '') { childName = pair.forbiddenPairEmail; }
          $(pairElement).find('[data-name="pairForbiddenPair"]').text(childName);

          $(pairElement).find('[data-name="pairDelete"]').on('click', () => {
            $('#removeUserDialog').prop('hidden', true);
            $('#deletePairDialog').prop('hidden', false);
            pairId = pair._id;
            pairEl = pairElement;
          });
          $('#forbiddenPairsTable tbody').append(pairElement);
        });
      });
    });

    // fill up the forbiddenPair modal select elements with usernames
    $.getJSON('/friends/api/list', function(result) {
      result.forEach(function(friend) {
        let name = friend.email;
        if (friend.name !== undefined && friend.name !== '') { name = friend.name; }
        $('#forbiddenUser1, #forbiddenUser2').append(`<option value="${friend._id}" data-email="${friend.email}">${name}</option>`);
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
        // TODO after adding try delete last pair, add template
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

    $('#removeUserDialog').on('click', () => {
      $.post(`${apiUrl}/user/delete`, { _id: userId, email: userEmail }, response => {
        showAlert(response);
        if (response.success) {
          $(userEl).remove();
        }
      });
    });

    $('#deletePairButton').on('click', () => {
      $.post(`${apiUrl}/forbidden/delete`, { _id: pairId }, result => {
        showAlert(result);
        if (result.success) {
          $(pairEl).remove();
        }
      });
    });
  });
});
