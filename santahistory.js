/*global $, document, setTimeout */

$(document).ready(function () {
    "use strict";

	// if present picture is open
	$("#present").on('show.bs.modal', function (event) {
		var picture = $(event.relatedTarget).data('picture');
		$('#image').attr('src', 'resources/images/' + picture);
	});

	// if present picture is closed
	$("#present").on('hidden.bs.modal', function () {
        $('#image').attr('src', '');
	});
});