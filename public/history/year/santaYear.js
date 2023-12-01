$(async () => {
  'use strict';

  const apiUrl = 'year/api';

  await $.getScript('/santa.js');
  const giftTemplate = await $.get('year/gift.html');

  const searchParams = new URLSearchParams(window.location.search);

  $('#yearTitle').text(searchParams.get('year'));

  $.getJSON(`${apiUrl}/gifts?_id=${searchParams.get('_id')}`, response => {
    if (response.gifts.length === 0) {
      showAlert({ warning: 'No gifts' });
      return;
    }
    response.gifts.forEach(gift => {
      listGifts(gift);
    });
  });

  function listGifts(gift) {
    const giftElement = $.parseHTML(giftTemplate);
    $(giftElement).find('#gift').text(gift.gift);
    $(giftElement).find('#santa').text(gift.santa);
    $(giftElement).find('#child').text(gift.child);
    if (gift.imageUploaded !== undefined) { // TODO gift_image
      lazyLoadImage(gift._id, $(giftElement).find('img')).then(image => {
        $(giftElement).find('img').attr('src', image.src);
      });
    }
    $('tbody').append(giftElement);
  }

  function lazyLoadImage(yearId, image) {
    console.log('here');
    return new Promise(function(resolve) {
      const lazyImage = new Image();
      const imageUrl = `${apiUrl}/image?_id=${yearId}`;
      lazyImage.src = imageUrl;

      lazyImage.onload = () => {
        image.src = imageUrl;
        resolve(image);
      };
    });
  }

  // if present picture is open
  $('#present').on('show.bs.modal', function(event) {
    const picture = $(event.relatedTarget).data('picture');
    $('#image').attr('src', 'resources/images/' + picture);
  });
});
