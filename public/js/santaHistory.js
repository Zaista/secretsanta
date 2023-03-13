/* global $, bootstrap */

$(async() => {
  'use strict';

  $('#menu').load('views/menu', () => {
    $('#menu-history').addClass('active');
    $('#menu-history').attr('aria-current', 'page');
  });

  const baseYearTemplate = await $.get('modules/year.html');
  const baseGiftTemplate = await $.get('modules/gift.html');
  const baseMenuTemplate = await $.get('modules/side-menu.html');

  $.getJSON('api/history', result => {
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
