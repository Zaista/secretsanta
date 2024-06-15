// eslint-disable-next-line no-unused-vars
const pageLoaded = new Promise((resolve) => {
  $('#menu').load('/modules/menu', () => {
    // group selection and info
    $('.groupOp').on('click', function () {
      $.get(
        `/api/setActiveGroup?groupId=${$(this).attr('value')}`,
        (response) => {
          if (response.success) location.reload();
          else showAlert(response);
        }
      );
    });

    // active page
    const pageMatcher = window.location.pathname.match(/\w+/);
    if (pageMatcher) {
      const currentPage = pageMatcher[0];
      $(`#menu-${currentPage}`).addClass('active').attr('aria-current', 'page');
    }

    // create new group
    $('#create-group-form').on('submit', () => {
      const groupName = $('#group-name').val();
      $.post('admin/api/group/create', { groupName }, (result) => {
        if (result.success) {
          window.location.href = '/admin?group-created';
        } else {
          showAlert({ error: 'Something went wrong' });
        }
      });
      return false;
    });
  });
  $('#footer').load('/modules/footer', () => {
    resolve();
  });
});

function showAlert(alert, timeout = 3000) {
  let alertClass;
  let message;
  if (alert.warning) {
    alertClass = 'alert-warning';
    message = alert.warning;
  } else if (alert.success) {
    alertClass = 'alert-success';
    message = alert.success;
  } else {
    alertClass = 'alert-danger';
    message = alert.error;
  }
  const alertElement = $('#footerAlert');
  alertElement.removeClass('alert-success alert-warning alert-danger');
  alertElement.addClass(alertClass);
  $('#footerAlert span').text(message);
  alertElement.show();
  if (timeout !== 0) {
    setTimeout(function () {
      $('#footerAlert').hide();
    }, timeout);
  }
}
