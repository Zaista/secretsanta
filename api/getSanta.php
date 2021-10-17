<?php

	$mysqli = require '../private/connect.php';
	
	// this adds a flavor
	sleep(1);

	$output = new stdClass();

	// if username or password was not found
	if(empty($_GET['santa-username']) || empty($_GET['santa-password'])) {
		$output->error = "Username or password not set.";
		echo json_encode($output);
		exit;
	}

	// store name from url parameter in variable
	$santa_username = $_GET['santa-username'];

	// store password from url parameter in variable
	$santa_password = $_GET['santa-password'];

	$stmt = $mysqli->prepare("
		SELECT c.FirstName, c.LastName, c.Username, c.Address FROM users u
		JOIN matches m ON u.UserId = m.SantaID
		JOIN users c ON m.ChildID = c.UserID
		WHERE u.Username = ? AND u.Password = ?");

	$stmt->bind_param('ss', $santa_username, $santa_password);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows == 0) {
		$output->error = "Incorrect username or password.";
		echo json_encode($output);
		exit;
	}

	$row = $result->fetch_assoc();
	$output->first_name = $row['FirstName'];
	$output->last_name = $row['LastName'];
	$output->username = $row['Username'];
	$output->address = $row['Address'];

	echo json_encode($output);

    $mysqli->close();

    exit;
?>