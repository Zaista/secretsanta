/* global $, bootstrap, groupId */

$(async () => {
  'use strict';

  await $.getScript('/js/commons.js');

  const groupId = getGroupId();

  const baseYearTemplate = await $.get('modules/year.html');
  const baseGiftTemplate = await $.get('modules/gift.html');
  const baseMenuTemplate = await $.get('modules/side-menu.html');

  $.getJSON(`api/history?groupId=${groupId}`, result => {
    result.forEach(yearData => {
      addYear(yearData.year, yearData.location, yearData.location_image);
      yearData.gifts.forEach(gifts => {
        addGifts(yearData.year, gifts);
      });
    });

    // eslint-disable-next-line no-new
    new bootstrap.ScrollSpy(document.getElementById('scroll-spy-page'), {
      target: '#navbar'
    });
    
    if (result.length === 0) {
      showAlert(false, 'No recorded history')
    }
  });

  function addYear(year, location, image) {
    let yearTemplate = baseYearTemplate;
    yearTemplate = yearTemplate
      .replace(/{{year}}/g, year)
      .replace(/{{location}}/, location);
    if (image != null) {
      yearTemplate = yearTemplate.replace(/{{yearImage}}/, year + '/' + image);
      yearTemplate = yearTemplate.replace(/picture-disabled/, '');
    } else {
      yearTemplate = yearTemplate.replace(/data-bs-toggle='modal'/, '');
      yearTemplate = yearTemplate.replace(/pointer/, '');
    }

    const menuTemplate = baseMenuTemplate.replace(/{{year}}/g, year);
    $('#scroll-spy-menu').append(menuTemplate);
    $('#scroll-spy-page').append(yearTemplate);
  }

  function addGifts(year, gifts) {
    let giftTemplate = baseGiftTemplate;
    if (gifts.gift_image != null) {
      giftTemplate = giftTemplate.replace(/{{year}}/ig, year);
      giftTemplate = giftTemplate.replace(/{{giftImage}}/ig, gifts.gift_image);
      giftTemplate = giftTemplate.replace('picture-disabled', 'pointer');
    } else {
      giftTemplate = giftTemplate.replace('data-bs-toggle="modal"', '');
    }
    giftTemplate = giftTemplate.replace(/{{santa}}/ig, gifts.santa);
    giftTemplate = giftTemplate.replace(/{{child}}/ig, gifts.child);
    giftTemplate = giftTemplate.replace(/{{gift}}/ig, gifts.gift);

    $(`#section-${year}`).append(giftTemplate);
  }

  // if present picture is open
  $('#present').on('show.bs.modal', function(event) {
    const picture = $(event.relatedTarget).data('picture');
    $('#image').attr('src', 'resources/images/' + picture);
  });

  // if present picture is closed
  $('#present').on('hidden.bs.modal', function() {
    $('#image').attr('src', '');
  });
});
