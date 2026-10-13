const apiUrl = 'admin/api';

// start reloads at the top: the browser would restore the old scroll position
// before the async-loaded menu and tables are in place, leaving it offset
history.scrollRestoration = 'manual';

$(async () => {
  'use strict';

  let userElement;
  let pairElement;

  await $.getScript('/santa.js');
  pageLoaded.then(async () => {
    setUpSectionNav();

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
            $('#groupName').text($('#groupNameSettings').val());
          }
        },
      });
      return false;
    });

    // fill up the forbiddenPair table with forbidden pairs
    function loadForbiddenPairs() {
      $.getJSON(`${apiUrl}/forbidden`, function (result) {
        $.get('admin/pair.html', (pairTemplate) => {
          $('#forbiddenPairsTable tbody').empty();
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
    }
    loadForbiddenPairs();

    // fill up the forbiddenPair modal select elements with usernames
    function loadForbiddenPairUsers() {
      $.getJSON('/friends/api/list', function (result) {
        $('#forbiddenUser1, #forbiddenUser2')
          .find('option[value!=""]')
          .remove();
        result.forEach(function (friend) {
          let name = friend.email;
          let label = friend.email;
          if (friend.name !== undefined && friend.name !== '') {
            name = friend.name;
            label = `${friend.name} (${friend.email})`;
          }
          $('#forbiddenUser1, #forbiddenUser2').append(
            $('<option>')
              .val(friend._id)
              .attr('data-email', friend.email)
              .attr('data-name', name)
              .text(label)
          );
        });
      });
    }
    loadForbiddenPairUsers();
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
              .text($('#forbiddenUser1 option:selected').attr('data-name'));

            $(_pairElement)
              .find('[data-name="pairForbiddenPair"]')
              .text($('#forbiddenUser2 option:selected').attr('data-name'));

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

    $('#inviteUserButton').on('click', function () {
      const newUser = {
        email: $('#newUserEmail').val(),
      };
      const request = $.post(`${apiUrl}/user`, newUser, (result) => {
        showAlert(result);
        const modal = $('#newUsersModal');
        // a warning means the user was invited but the email failed
        if (!result.success && !result.warning) {
          // keep the email, so the admin can correct it in the dialog
          bootstrap.Modal.getInstance(modal).hide();
          return;
        }
        loadForbiddenPairUsers();
        $('#newUserEmail').val('');
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
          bootstrap.Modal.getInstance(modal).hide();
        });
      });
      showButtonSpinner(this, request);
    });

    // wait for both, so the reveal status is appended after the draft status
    Promise.all([
      $.getJSON(`${apiUrl}/draft`),
      $.getJSON(`${apiUrl}/reveal`),
    ]).then(([draftResponse, revealResponse]) => {
      const nextYear = new Date().getFullYear() + 1;
      if (draftResponse.success) {
        $('#yearAlert').text(
          `Santa pairs for year ${nextYear} were not drafted yet`
        );
        $('#draft').removeAttr('disabled');
      } else {
        $('#yearAlert').text(
          `Santa pairs for year ${nextYear} were already drafted`
        );
      }
      if (revealResponse.success) {
        $('#reveal').removeAttr('disabled');
        $('#yearAlert').append(' but the pairs were not yet revealed');
      }
    });

    $('#draft').on('click', function () {
      const request = $.ajax({ url: `${apiUrl}/draft`, method: 'PUT' });
      showButtonSpinner(this, request);
      // chained after showButtonSpinner, so its restore runs first and a
      // successful draft leaves the button disabled
      Promise.resolve(request).then(
        (result) => {
          // a warning means the pairs were drafted but the email failed
          if (result.success || result.warning) {
            $(this).prop('disabled', true);
            $('#reveal').prop('disabled', false);
          }
          showAlert(result);
        },
        () => {}
      );
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
            // the user's forbidden pairs were deleted along with them
            loadForbiddenPairs();
            loadForbiddenPairUsers();
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

// Highlights the menu entry of the section being read. Bootstrap's scrollspy
// works on intersection ratios and skips short sections such as Drafting, so
// this picks the last section whose top has scrolled past a fixed line.
function setUpSectionNav() {
  const nav = document.getElementById('admin-nav');
  const links = [...nav.querySelectorAll('.nav-link')];
  const sections = links.map((link) =>
    document.querySelector(link.getAttribute('href'))
  );
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // while a click scrolls to its section, keep that link active instead of
  // whatever the scroll passes by (the last sections may never reach the top)
  let clickedLink = null;
  let clickTimer;

  function activate(activeLink) {
    for (const link of links) {
      const active = link === activeLink;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
    // on phones the menu is a horizontal row: keep the active pill in view
    if (nav.scrollWidth > nav.clientWidth) {
      const left =
        activeLink.offsetLeft -
        nav.offsetLeft -
        (nav.clientWidth - activeLink.offsetWidth) / 2;
      nav.scrollTo({
        left,
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
    }
  }

  function update() {
    if (clickedLink) {
      return;
    }
    const scrollMargin = parseFloat(
      getComputedStyle(sections[0]).scrollMarginTop
    );
    const line = scrollMargin + window.innerHeight / 4;
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    let index = 0;
    if (atBottom) {
      index = sections.length - 1;
    } else {
      sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= line) {
          index = i;
        }
      });
    }
    if (!links[index].classList.contains('active')) {
      activate(links[index]);
    }
  }

  function releaseClickLater() {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clickedLink = null), 150);
  }

  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      clickedLink = link;
      activate(link);
      sections[i].scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
      releaseClickLater();
    });
  });

  window.addEventListener(
    'scroll',
    () => (clickedLink ? releaseClickLater() : update()),
    { passive: true }
  );
  window.addEventListener('resize', update);
  update();
}
