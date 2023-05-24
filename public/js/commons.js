/* global $ */

$('#menu').load('/views/menu', () => {
  // group selection and info
  const preselectedGroup = JSON.parse(window.localStorage.getItem('group'));
  if (preselectedGroup?._id) {
    $('#groupSelector').val(preselectedGroup._id);
    $('#groupName').html(preselectedGroup.name);
  } else {
    const group = {
      _id: $('#groupSelector option:first').val(),
      name: $('#groupSelector option:first').text()
    };
    window.localStorage.setItem('group', JSON.stringify(group));
    $('#groupSelector').val(group._id);
    $('#groupName').html(group.name);
  }

  $('.groupOp').on('click', function ()  {
    const newGroup = {
      _id: $(this).attr("value"),
      name: $(this).text()
    };
    window.localStorage.setItem('group', JSON.stringify(newGroup));
    location.reload();
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
function showAlert(success, message) {
  const alertClass = success ? 'alert-success' : 'alert-danger';
  const alertElement = $('.alert');
  alertElement.removeClass('alert-success alert-danger');
  alertElement.addClass(alertClass);
  $('.alert span').text(message);
  alertElement.show();
  setTimeout(function() {
    $('.alert').hide();
  }, 3000);
}

// eslint-disable-next-line
function getGroupId() {
  return JSON.parse(window.localStorage.getItem('group'))._id;
}
