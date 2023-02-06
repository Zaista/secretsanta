/*global $, document, setTimeout */

$(function () {
	"use strict";

	var request;
	// send a username and password, get the santa name and address and display it
	$("#santa-form").on('submit', function () {
		$("#santa-dialog").modal("show");
		var username = $('#santa-username').val().toLowerCase();
		var password = $('#santa-password').val();
		request = $.get("api/santa?username=" + username + "&password=" + password, function (result, status) {
			if (status === 'success') {
				if (result.error) {
					$("#santa-display").empty();
					$("#santa-display").append('<div class="alert alert-warning">This is not the santa you are looking for.<br><span>(' + result.error + ')</span></div>');
				} else {
				  // TODO below was used to display rematch message
					if (false) {
						$('#santa-display').empty();
						$("#santa-display").append('<div class="alert alert-success">' + result[0].firstName + '</div>');
					} else {
						$("#santa-display").empty();
						var name = result[0].firstName;
						if (result.last_name) {
							name += " " + result[0].lastName;
						}
						$("#santa-display").append('<p id="santa_name" style="font-size: 30px;"><strong>' + name + '</strong></p>');
						$("#santa-display").append('<img src="resources/images/' + result[0].username + '.png">');
						if (result[0].address)
							$("#santa-display").append('<br><br><p id="santa_address" style="font-size: 20px;">Address: ' + result[0].address + '</p>');
					}
				}
			}
		});
		return false;
	});
});