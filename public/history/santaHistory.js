$(async () => {
  'use strict';

  const apiUrl = 'history/api';
  const yearApiUrl = 'history/year/api';

  await $.getScript('/santa.js');
  const yearTemplate = await $.get('/history/year.html');

  $.getJSON(`${apiUrl}/list`, years => {
    if (years.length === 0) {
      showAlert({ warning: 'No recorded history' });
      return;
    }
    years.forEach(year => {
      listYears(year);
    });
  });

  function listYears(year) {
    const yearElement = $.parseHTML(yearTemplate);
    $(yearElement).find('#yearTitle').text(year.year);
    $(yearElement).find('#yearLocation').text(year.location);
    if (year.imageUploaded) {
      lazyLoadImage(year._id, $(yearElement).find('img')).then(image => {
        $(yearElement).find('#locationImage').attr('src', image.src).attr('hidden', false);
        $(yearElement).find('#locationIcon').attr('hidden', true);
      });
    }
    $(yearElement).on('click', function() {
      window.location.href = `/history/year?id=${year._id}`;
    });
    $('#yearList').append(yearElement);
  }

  function lazyLoadImage(yearId, image) {
    return new Promise(function(resolve) {
      const lazyImage = new Image();
      const imageUrl = `${yearApiUrl}/location-image?id=${yearId}`;
      lazyImage.src = imageUrl;

      lazyImage.onload = () => {
        image.src = imageUrl;
        resolve(image);
      };
    });
  }
});
