<?php

	// this add a flavor
	sleep(1);

	// if username or password was not found
	if(empty($_GET['santa']) || empty($_GET['pwd'])) {
		echo "Warning. Username or password not set!";
		exit;
	}

	// store name from url parameter in variable
	$santa = $_GET['santa'];

	// store password from url parameter in variable
	$pwd = $_GET['pwd'];

	// DATABASE CONNECTION
	$hostname = 'db18.cpanelhosting.rs';
	$username = 'zaista_secretsanta';
	$password = 'Aven.021';
	$database = 'zaista_secretsanta';

	$mysqli = new mysqli($hostname, $username, $password, $database);

	// check connection
	if ($mysqli->connect_error) {
		die("Connection failed: " . $mysqli->connect_error);
		echo "Warning. Connection to database failed!";
		exit;
	}

	// this will make sure cyrilic letters are displayed properly
	$mysqli->query("SET NAMES utf8");


	if ($santa === 'joca_santa' && $pwd ==='santa_seed') {
		// this will reset santa pairs
		ob_start();
		require 'match.php';
		$buffer = ob_get_contents();
		exit;
	}

	$stmt = $mysqli->prepare("
		SELECT c.Name AS Secretsanta, c.Image FROM users u
		JOIN matches m ON u.UserId = m.SantaID
		JOIN users c ON m.ChildID = c.UserID
		WHERE u.Username = ? AND u.Password = ?");

	$stmt->bind_param('ss', $santa, $pwd);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows == 0) {

		echo "Warning. Wrong username or password!";
		exit;
	}

	$row = $result->fetch_assoc();
	$child = array($row['Secretsanta'], $row['Image']);

	echo json_encode($child);
?>
