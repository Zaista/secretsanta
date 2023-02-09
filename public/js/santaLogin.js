/*global $, document, setTimeout */

$(function () {
	"use strict";

	$("#santa-form").on('submit', function () {
		let username = $('#santa-username').val().toLowerCase();
		let password = $('#santa-password').val();
		// TODO switch to post
		$.get("api/login?username=" + username + "&password=" + password, function (result, status) {
			if (status === 'success') {
				if (result.error) {
				  $('.alert').removeClass('alert-success alert-danger');
          $('.alert').addClass('alert-danger');
          $('.alert span').text(result.error);
          $('.alert').show();
          setTimeout(function () {
            $('.alert').hide();
          }, 3000);
				} else {
				  window.location.href = '/';
        }
			}
		});
		return false;
	});
});