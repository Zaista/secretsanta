/* global $ */

$('#menu').load('/views/menu', () => {
  // group selection and info
  $('.groupOp').on('click', function() {
    const newGroup = {
      _id: $(this).attr('value'),
      name: $(this).text()
    };
    $.get(`/api/setActiveGroup?groupId=${newGroup._id}`, response => {
      if (response.success) location.reload();
      else showAlert(response);
    });
  });

  // active page
  const pageMatcher = window.location.pathname.match(/\w+/);
  if (pageMatcher) {
    const currentPage = pageMatcher[0];
    $(`#menu-${currentPage}`).addClass('active');
    $(`#menu-${currentPage}`).attr('aria-current', 'page');
  }
});

// eslint-disable-next-line
function showAlert(alert) {
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
  const alertElement = $('.alert');
  alertElement.removeClass('alert-success alert-danger');
  alertElement.addClass(alertClass);
  $('.alert span').text(message);
  alertElement.show();
  setTimeout(function() {
    $('.alert').hide();
  }, 3000);
}
