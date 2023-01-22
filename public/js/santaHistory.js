/*global $, document, setTimeout */

$(function () {
	"use strict";
	
	$.getJSON("api/history", function (result) {
		$.each(result, function (index, yearData) {
			addYear(yearData.year, yearData.location, yearData.location_image);
			$.each(yearData.gifts, function (i, gifts) {
				addGifts(yearData.year, gifts);
			});
		});
	});

	function addYear(year, label, image) {

		let yearTemplate = $('#year_template').html();
		yearTemplate = yearTemplate.replace(/{{year}}/g, year);
		yearTemplate = yearTemplate.replace(/{{label}}/, label);
		if (image != null) {
			yearTemplate = yearTemplate.replace(/{{yearImage}}/, year + "/" + image);
			yearTemplate = yearTemplate.replace(/picture-disabled/, '');
		} else {
			yearTemplate = yearTemplate.replace(/data-bs-toggle="modal"/, "");
			yearTemplate = yearTemplate.replace(/pointer/, '');
		}
		$('#accordion').append(yearTemplate); 
	}

	function addGifts(year, gifts) {
		let giftTemplate = $('#gift_template').html();

		if (gifts.gift_image != null) {
			giftTemplate = giftTemplate.replace(/{{year}}/ig, year);
			giftTemplate = giftTemplate.replace(/{{giftImage}}/ig, gifts.gift_image);
			giftTemplate = giftTemplate.replace("picture-disabled", "pointer");
		} else {
			giftTemplate = giftTemplate.replace("data-bs-toggle=\"modal\"", "");
		}
		giftTemplate = giftTemplate.replace(/{{santa}}/ig, gifts.santa);
		giftTemplate = giftTemplate.replace(/{{child}}/ig, gifts.child);
		giftTemplate = giftTemplate.replace(/{{gift}}/ig, gifts.gift);

		$('div#collapse' + year + ' #table_body').append(giftTemplate);
	}

	// if present picture is open
	$("#present").on('show.bs.modal', function (event) {
		let picture = $(event.relatedTarget).data('picture');
		$('#image').attr('src', 'resources/images/' + picture);
	});

	// if present picture is closed
	$("#present").on('hidden.bs.modal', function () {
        $('#image').attr('src', '');
	});
});