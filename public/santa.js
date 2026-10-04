// eslint-disable-next-line no-unused-vars
const pageLoaded = new Promise((resolve) => {
  $('#menu').load('/modules/menu', () => {
    // group selection and info
    $('.groupOp').on('click', function () {
      $.get(
        `/api/setActiveGroup?groupId=${$(this).attr('value')}`,
        (response) => {
          // navigate instead of reload, so the browser doesn't restore the
          // scroll position (which lands below the async-loaded menu)
          if (response.success)
            location.replace(location.pathname + location.search);
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

let alertTimer;

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
  // an earlier alert's timer must not hide this one
  clearTimeout(alertTimer);
  if (timeout !== 0) {
    alertTimer = setTimeout(function () {
      $('#footerAlert').hide();
    }, timeout);
  }
}

// shows a spinner on the button and disables it until the request settles, so
// slow requests (emails, uploads) don't look unresponsive or get sent twice
// eslint-disable-next-line no-unused-vars
function showButtonSpinner(button, request) {
  const buttonElement = $(button);
  const spinner = $(
    '<span data-name="buttonSpinner">' +
      '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>' +
      '<span class="visually-hidden" role="status">Loading...</span>' +
      '</span>'
  );
  buttonElement.prop('disabled', true).prepend(spinner);
  const restore = () => {
    spinner.remove();
    buttonElement.prop('disabled', false);
  };
  // two callbacks instead of finally(), so a failed request isn't reported as an unhandled rejection
  Promise.resolve(request).then(restore, restore);
  return request;
}
