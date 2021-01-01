/*global $, document, setTimeout */

$(document).ready(function () {
	"use strict";

	var request;
	// send a username and password, get the santa name and address and display it
	$("form").submit(function () {
		$("#santa-dialog").modal("show");
		var username = $('#santa-username').val().toLowerCase();
		var password = $('#santa-password').val();
		request = $.get("api/getSanta.php?santa-username=" + username + "&santa-password=" + password, function (data, status) {
			if (status === 'success') {
				var result = JSON.parse(data);
				if (result.error) {
					$("#santa-display").empty();
					$("#santa-display").append('<div class="alert alert-warning">This is not the santa you are looking for.<br><span>(' + result.error + ')</span></div>');
				} else {
					if (result.match) {
						$("#santa-display").empty();
						$("#santa-display").append('<div class="alert alert-success">' + result.match + '</div>');
					} else {
						$("#santa-display").empty();
						$("#santa-display").append('<p style="font-size: 30px;"><strong>' + result.santa + '</strong></p>');
						$("#santa-display").append('<img src="resources/images/' + result.image + '.png">');
						if (result.address)
							$("#santa-display").append('<br><br><p style="font-size: 20px;">Address: ' + result.address + '</p>');
					}
				}
			}
		});
		return false;
	});

	$("#emailPasswords").click(function () {
		var person_id = $("#email-select").val();
		request = $.get("api/emailPasswords.php?person=" + person_id, function (data) {
			var result = JSON.parse(data);
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

	// when santa-dialog is closed return a spinner in place
	$('#santa-dialog').on('hidden.bs.modal', function () {
		$("#santa-display").empty();
		$("#santa-display").append('<div class="loader"></div>');
	});
});