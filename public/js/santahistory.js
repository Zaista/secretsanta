/*global $, document, setTimeout */

$(document).ready(function () {
	"use strict";
	
	$.getJSON("api/getHistory.php", function (result) {
		$.each(result, function (archiveYear, archiveData) {

			addYear(archiveYear, archiveData.label, archiveData.image);

			$.each(archiveData.gifts, function (i, gifts) {
				addGifts(gifts);
			});

		});
	});

	function addYear(year, label, image) {

		var year_template = $('#year_template').html();
		year_template = year_template.replace(/{{year}}/g, year);
		year_template = year_template.replace(/{{label}}/, label);
		if (image != null) {
			year_template = year_template.replace(/{{yearImage}}/, year + "/" + image);
			year_template = year_template.replace(/picture-disabled/, '');
		} else {
			year_template = year_template.replace(/data-bs-toggle="modal"/, "");
			year_template = year_template.replace(/pointer/, '');
		}
		$('#accordion').append(year_template); 
	}

	function addGifts(gifts) {

		var gift_template = $('#gift_template').html();

		if (gifts.image != null) {
			gift_template = gift_template.replace(/{{year}}/ig, gifts.year);
			gift_template = gift_template.replace(/{{giftImage}}/ig, gifts.image);
			gift_template = gift_template.replace("picture-disabled", "pointer");
		} else {
			gift_template = gift_template.replace("data-bs-toggle=\"modal\"", "");
		}
		gift_template = gift_template.replace(/{{santa}}/ig, gifts.santa);
		gift_template = gift_template.replace(/{{child}}/ig, gifts.child);
		gift_template = gift_template.replace(/{{gift}}/ig, gifts.gift);

		$('div#collapse' + gifts.year + ' #table_body').append(gift_template);
	}

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