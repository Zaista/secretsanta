/*global $, document, setTimeout */

$(document).ready(function () {
	"use strict";

	// if friend sheet is open
	$("#friend").on('show.bs.modal', function (event) {
		var picture = $(event.relatedTarget).data('picture');
		$('#sheet').attr('src', 'resources/images/' + picture);
	});

	// if friend sheet is closed
	$("#friend").on('hide.bs.modal', function () {
		setTimeout(function () {
			$('#sheet').attr('src', '');
		}, 300);
	});
});