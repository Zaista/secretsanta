/* global $, setTimeout */

$(function() {
  'use strict';

  $('#menu').load('views/menu', () => {
    $('#menu-admin').addClass('active');
    $('#menu-admin').attr('aria-current', 'page');
  });

  $('#emailNotifications').change(onChangeDetector);
  $('#groupName').on('input', onChangeDetector);

  $.getJSON('api/users', function(result) {
    $.get('modules/user.html', userTemplate => {
      $.each(result, function(index, userData) {
        const userElement = $.parseHTML(userTemplate);
        $(userElement).find('#index').text(++index);
        $(userElement).find('#name').text(userData.name);
        $(userElement).find('#profile').attr('href', `/friends/${userData.userId}`);
        $(userElement).find('#email').text(userData.email);
        $(userElement).find('#role').val(userData.role);
        $(userElement).find('#role').on('input', onChangeDetector);
        if (userData.active) {
          $(userElement).find('#status').attr('checked', true);
        }
        $(userElement).find('#status').on('input', onChangeDetector);
        $('#users tbody').append(userElement);
      });
    });
  });

  const groupId = '641205f5773c5e2f26f6f9aa';
  $.getJSON(`api/group/${groupId}`, result => {
    $('#groupName').val(result.name);
    $('#emailNotifications').val(`${result.emailNotifications}`);
  });

  $('#groupForm').on('submit', function() {

    const groupData = {
      name: $('#groupName').val(),
      emailNotifications: $('#emailNotifications').val()
    }

    $.post(`api/group/${groupId}`, groupData, result => {
      $('.alert').removeClass('alert-success alert-danger');
      if (result.error) {
        $('.alert').addClass('alert-danger');
      } else {
        $('.alert').addClass('alert-success');
      }
      $('.alert span').text(result.message);
      $('.alert').show();
      setTimeout(function() {
        $('.alert').hide();
      }, 3000);
    });

    return false;
  });

  function onChangeDetector() {
    if ($(this).attr('data-onchange') === 'group' )
      $('#groupButton').removeAttr('disabled');
    else if ($(this).attr('data-onchange') === 'users' )
      $('#userButton').removeAttr('disabled');
  }

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
        $('.alert').removeClass('alert-success alert-danger');
        $('.alert').addClass('alert-success');
        $('.alert span').text(result.success);
        $('.alert').show();
        setTimeout(function() {
          $('.alert').hide();
        }, 3000);
      }
    });
  });


        // TODO below was used to display rematch message
        //        if (false) {
        //          $('#santa-display').empty();
        //          $('#santa-display').append('<div class="alert alert-success">' + result[0].firstName + '</div>');
        //        } else {
        //          $("#santa-display").empty();
        //          var name = result[0].firstName;
        //          if (result[0].lastName) {
        //            name += " " + result[0].lastName;
        //          }
        //          $("#santa-display").append('<p id="santa_name" style="font-size: 30px;"><strong>' + name + '</strong></p>');
        //          $("#santa-display").append('<img src="resources/images/' + result[0].username + '.png">');
        //          if (result[0].address)
        //            $("#santa-display").append('<br><br><p id="santa_address" style="font-size: 20px;">Address: ' + result[0].address + '</p>');
        //        }
});
