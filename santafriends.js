/*global $, document, setTimeout */

$(document).ready(function () {
	"use strict";

	var users = [];

	$.getJSON("api/getUsers.php", function (result) {
		$.each(result, function (i, userData) {
			var santa_template = $("#santa-template").html();

			santa_template = santa_template.replace(/{{user}}/g, userData.Username);
			santa_template = santa_template.replace(/{{index}}/, i);
			$(".friends").append(santa_template);
			users.push(userData);
		});
	});

	// if friend sheet is open
	$("#friend").on('show.bs.modal', function (event) {
		var picture = $(event.relatedTarget).data('picture');
		var user_id = $(event.relatedTarget).data('index');
		$('#santa_sheet').attr('src', 'resources/images/' + picture);
		var name = users[user_id].FirstName;
		if (users[user_id].LastName) {
			name += " " + users[user_id].LastName;
		}
		$('#santa_name').html("<b>Name:</b> " + name);

		if (users[user_id].Email) {
			$('#santa_email').html("<b>Email:</b> " + users[user_id].Email);
		} else {
			$('#santa_email').html("<b>Email:</b> No email set.");
		}

		if (users[user_id].Address) {
			$('#santa_address').html("<b>Address:</b> " + users[user_id].Address);
		} else {
			$('#santa_address').html("<b>Address:</b> No address set.");
		}
	});

	// if friend sheet is closed
	$("#friend").on('hidden.bs.modal', function () {
		$('#santa_sheet').attr('src', '');
	});
});