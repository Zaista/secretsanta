/*global $, document, setTimeout */

$(function () {
	"use strict";

	let request;
	// send a username and password, get the santa name and address and display it
  let username = 'joca';
  let password = 'cowboys';
  request = $.get("api/santa?username=" + username + "&password=" + password, function (result, status) {
    if (status === 'success') {
      if (result.error) {
        $("#santa-display").empty();
        $("#santa-display").append('<div class="alert alert-success">' + result[0].firstName + '</div>');
      } else {
        // TODO below was used to display rematch message
        if (false) {
          $('#santa-display').empty();
          $("#santa-display").append('<div class="alert alert-success">' + result[0].firstName + '</div>');
        } else {
//          $("#santa-display").empty();
//          var name = result[0].firstName;
//          if (result[0].lastName) {
//            name += " " + result[0].lastName;
//          }
//          $("#santa-display").append('<p id="santa_name" style="font-size: 30px;"><strong>' + name + '</strong></p>');
//          $("#santa-display").append('<img src="resources/images/' + result[0].username + '.png">');
//          if (result[0].address)
//            $("#santa-display").append('<br><br><p id="santa_address" style="font-size: 20px;">Address: ' + result[0].address + '</p>');
        }
      }
    }
  });

	$("#emailPasswords").on('click', function () {
		var person_id = $("#email-select").val();
		$.getJSON("api/email?person=" + person_id, function (result) {
			if (result.error) {
				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-danger');
				$('.alert span').text(result.error);
				$('.alert').show();
				setTimeout(function () {
					$('.alert').hide();
				}, 3000);
			} else {
				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-success');
				$('.alert span').text(result.success);
				$('.alert').show();
				setTimeout(function () {
					$('.alert').hide();
				}, 3000);
			}
		});
	});

	$("#rematch-form").on('submit', function () {
		var password = $("#rematch-password").val();
		$.getJSON("api/match?password=" + password, function (result) {
			if (result.error) {
				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-danger');
				$('.alert span').text(result.error);
				$('.alert').show();
				setTimeout(function () {
					$('.alert').hide();
				}, 3000);
			} else {
				$('.alert').removeClass('alert-success alert-danger');
				$('.alert').addClass('alert-success');
				$('.alert span').text(result.match);
				$('.alert').show();
				setTimeout(function () {
					$('.alert').hide();
				}, 3000);
				$('#rematch-dialog').modal('hide');
			}
		});
		return false;
	});
});