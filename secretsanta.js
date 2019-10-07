$(document).ready(function(){
	var request;
	// send a username and password, get the santa name and address and display it
	$("form").submit(function(){
		request = $.get("getsanta.php?santa=" + $('#santa').val().toLowerCase() + "&pwd=" + $('#pwd').val(), function(data, status) {
			if (status === 'success' && data.indexOf("Warning") == -1) {
				if (data.indexOf("successfully") >= 0) {
					$("#santa-display").empty();
					$("#santa-display").append('<div class="alert alert-success">' + data + '</div>');
				} else {
					var result = JSON.parse(data);
					$("#santa-display").empty();
					$("#santa-display").append('<p style="font-size: 30px;"><strong>' + result[0] + '</p></strong>');
					$("#santa-display").append('<img src="images/' + result[1] + '">');
				}
			} else {
				$("#santa-display").empty();
				$("#santa-display").append('<div class="alert alert-warning">This is not the santa you are looking for!<br><span>(' + data + ')</span></div>');
			}
		});
		return false;
	});

	// when santa-dialog is closed return a spinner in place
	$('#santa-dialog').on('hidden.bs.modal', function () {
		$("#santa-display").empty();
		$("#santa-display").append('<div class="loader"></div>');
		request.abort();
	})

	// if enter is pressed submit click event
	$('.textfield').keypress(function (e) {
		var key = e.which;
		// the enter key code
		if(key == 13) {
			$("#santa").click();
		}
	});

	// if present picture is open
	$("#present").on('show.bs.modal', function(event) {
		var picture = $(event.relatedTarget).data('picture');
		$('#image').attr('src', 'images/' + picture);
	});

	// if present picture is closed
	$("#present").on('hide.bs.modal', function(event) {
		setTimeout(function() {
			$('#image').attr('src', '');
		}, 300);
	});

	// if friend sheet is open
	$("#friend").on('show.bs.modal', function(event) {
		var picture = $(event.relatedTarget).data('picture');
		$('#sheet').attr('src', 'images/' + picture);
	});

	// if friend sheet is closed
	$("#friend").on('hide.bs.modal', function(event) {
		setTimeout(function() {
			$('#sheet').attr('src', '');
		}, 300);
	});
});
