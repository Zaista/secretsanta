const apiUrl = 'admin/api';

$(async () => {
  'use strict';

  let userElement;
  let pairElement;

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

    $.getJSON(`${apiUrl}/users`, function (result) {
      $.get('admin/user.html', (userTemplate) => {
        $.each(result, function (index, userData) {
          const _userElement = $.parseHTML(userTemplate);
          $(_userElement).find('[data-name="userIndex"]').text(++index);
          $(_userElement).find('[data-name="userEmail"]').text(userData.email);
          $(_userElement).find('a').attr('href', `/profile?id=${userData._id}`);
          $(_userElement).find('[data-name="userId"]').val(userData._id);
          $(_userElement)
            .find('[data-name="userRole"]')
            .val(userData.groups.role);
          $(_userElement)
            .find('[data-name="userRole"]')
            .on('input', onChangeDetector);

          $(_userElement)
            .find('[data-name="userRemove"]')
            .on('click', () => {
              // userId = userData._id;
              // userEmail = userData.email;
              userElement = _userElement;
            });
          $('#usersTable tbody').append(_userElement);
        });
      });
    });

    $('#userButton').on('click', function () {
      const usersRoles = [];
      $('tr[data-name="userRow"]').each(function () {
        const userData = {
          _id: $(this).find('[data-name="userId"]').val(),
          role: $(this).find(':selected').val(),
        };
        usersRoles.push(userData);
      });
      $.post(`${apiUrl}/users`, { usersRoles }, (result) => {
        showAlert(result);
        $(this).prop('disabled', true);
      });
      return false;
    });

    $.getJSON(`${apiUrl}/group`, (group) => {
      $('#groupNameSettings').val(group.name);
      $('#userAddedNotification').prop('checked', group.userAddedNotification);
      $('#messageSentNotification').prop(
        'checked',
        group.messageSentNotification
      );
      $('#yearDraftedNotification').prop(
        'checked',
        group.yearDraftedNotification
      );
    });

    $('#groupButton').on('click', function () {
      const groupData = {
        name: $('#groupNameSettings').val(),
        userAddedNotification: $('#userAddedNotification').prop('checked'),
        messageSentNotification: $('#messageSentNotification').prop('checked'),
        yearDraftedNotification: $('#yearDraftedNotification').prop('checked'),
      };
      $.ajax({
        url: `${apiUrl}/group`,
        type: 'POST',
        data: JSON.stringify(groupData),
        contentType: 'application/json',
        success: (result) => {
          showAlert(result);
          if (result.success) {
            $('#groupName').html($('#groupNameSettings').val());
          }
        },
      });
      return false;
    });

    // fill up the forbiddenPair table with forbidden pairs
    $.getJSON(`${apiUrl}/forbidden`, function (result) {
      $.get('admin/pair.html', (pairTemplate) => {
        result.forEach((pair, index) => {
          const _pairElement = $.parseHTML(pairTemplate);
          $(_pairElement).find('[data-name="pairId"]').val(pair._id);
          $(_pairElement).find('[data-name="pairIndex"]').text(++index);
          let santaName = pair.user;
          if (pair.user === undefined || pair.user === '') {
            santaName = pair.userEmail;
          }
          $(_pairElement).find('[data-name="pairUser"]').text(santaName);
          let childName = pair.forbiddenPair;
          if (pair.forbiddenPair === undefined || pair.forbiddenPair === '') {
            childName = pair.forbiddenPairEmail;
          }
          $(_pairElement)
            .find('[data-name="pairForbiddenPair"]')
            .text(childName);

          $(_pairElement)
            .find('[data-name="pairDelete"]')
            .on('click', () => {
              pairElement = _pairElement;
            });
          $('#forbiddenPairsTable tbody').append(_pairElement);
        });
      });
    });

    // fill up the forbiddenPair modal select elements with usernames
    $.getJSON('/friends/api/list', function (result) {
      result.forEach(function (friend) {
        let name = friend.email;
        if (friend.name !== undefined && friend.name !== '') {
          name = friend.name;
        }
        $('#forbiddenUser1, #forbiddenUser2').append(
          `<option value="${friend._id}" data-email="${friend.email}">${name}</option>`
        );
      });
    });
    $('#forbiddenPairsForm').on('submit', () => {
      const pair = {
        forbiddenUser1Id: $('#forbiddenUser1').val(),
        forbiddenUser2Id: $('#forbiddenUser2').val(),
      };
      $.post(`${apiUrl}/forbidden`, pair, (result) => {
        showAlert(result);
        if (result.success) {
          $.get('admin/pair.html', (pairTemplate) => {
            const _pairElement = $.parseHTML(pairTemplate);
            $(_pairElement).find('[data-name="pairId"]').val(result.id);
            const rowIndex = $('#forbiddenPairsTable tr').length;
            $(_pairElement).find('[data-name="pairIndex"]').text(rowIndex);
            $(_pairElement)
              .find('[data-name="pairUser"]')
              .text($('#forbiddenUser1 option:selected').text());

            $(_pairElement)
              .find('[data-name="pairForbiddenPair"]')
              .text($('#forbiddenUser2 option:selected').text());

            $(_pairElement)
              .find('[data-name="pairDelete"]')
              .on('click', () => {
                pairElement = _pairElement;
              });
            $('#forbiddenPairsTable > tbody:last-child').append(_pairElement);
          });
        }
        const modal = $('#forbiddenPairsModal');
        bootstrap.Modal.getInstance(modal).hide();
      });
      return false;
    });

    $('#userRemoveButton').on('click', () => {
      const newUser = {
        email: $('#newUserEmail').val(),
      };
      $.post(`${apiUrl}/user`, newUser, (result) => {
        showAlert(result);
        $.get('admin/user.html', (userTemplate) => {
          const _userElement = $.parseHTML(userTemplate);
          const rowIndex = $('#usersTable tr').length;
          $(_userElement).find('[data-name="userIndex"]').text(rowIndex);
          $(_userElement).find('[data-name="userEmail"]').text(newUser.email);
          $(_userElement)
            .find('a')
            .attr('href', `/profile?id=${result.userId}`);
          $(_userElement).find('[data-name="userId"]').val(result.userId);
          $(_userElement).find('[data-name="userRole"]').val('user');
          $(_userElement)
            .find('[data-name="userRole"]')
            .on('input', onChangeDetector);

          $(_userElement)
            .find('[data-name="userRemove"]')
            .on('click', () => {
              userElement = _userElement;
            });
          $('#usersTable tbody').append(_userElement);
          const modal = $('#newUsersModal');
          bootstrap.Modal.getInstance(modal).hide();
        });
      });
    });

    $.getJSON(`${apiUrl}/draft`, (response) => {
      if (response.success) {
        $('#yearAlert').text(
          `Santa pairs for year ${new Date().getFullYear() + 1} were not drafted yet`
        );
        $('#draft').removeAttr('disabled');
      } else {
        $('#yearAlert').text(
          `Santa pairs for year ${new Date().getFullYear() + 1} were already drafted`
        );
      }
    });

    $.getJSON(`${apiUrl}/reveal`, (response) => {
      if (response.success) {
        $('#reveal').removeAttr('disabled');
        $('#yearAlert').append(' but the pairs were not yet revealed');
      }
    });

    $('#draft').on('click', function () {
      $.ajax({
        url: `${apiUrl}/draft`,
        method: 'PUT',
        success: (result) => {
          if (result.success) {
            $(this).prop('disabled', true);
          }
          showAlert(result);
        },
      });
      return false;
    });

    $('#reveal').on('click', function () {
      $.ajax({
        url: `${apiUrl}/reveal`,
        method: 'PUT',
        success: (result) => {
          if (result.success) {
            $(this).prop('disabled', true);
          }
          showAlert(result);
        },
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

    $('#removeUserButton').on('click', () => {
      $.post(
        `${apiUrl}/user/delete`,
        {
          _id: $(userElement).find('[data-name="userId"]').val(),
          email: $(userElement).find('[data-name="userEmail"]').text(),
        },
        (response) => {
          showAlert(response);
          if (response.success) {
            $(userElement).remove();
          }
        }
      );
    });

    $('#deleteForbiddenPairButton').on('click', () => {
      $.post(
        `${apiUrl}/forbidden/delete`,
        { _id: $(pairElement).find('[data-name="pairId"]').val() },
        (result) => {
          showAlert(result);
          if (result.success) {
            $(pairElement).remove();
          }
        }
      );
    });
  });
});
