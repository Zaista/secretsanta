<?php

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
	
	function connect($xml) {
	    // create connection
	    $mysqli = new mysqli($xml->database->hostname, $xml->database->username, $xml->database->password, $xml->database->database);
	    // check connection
	    if ($mysqli->connect_error) {
	        die("Connection failed: " . $mysqli->connect_error);
	    }
	    
	    // this will make sure cyrilic letters are displayed properly
	    $mysqli->query("SET NAMES utf8");
	    
	    return $mysqli;
	}
	
	function get_config($config) {
	    // load configuration file
	    $xml = simplexml_load_file($config) or die("Error: Cannot load configuration file");
	    return $xml;
	}

	$xml = get_config('../private/config.xml');
	$mysqli = connect($xml);

	if ($santa_username === 'joca_santa' && $santa_password ==='santa_seed') {
		// this will reset santa pairs
		ob_start();
		require 'match.php';
		exit;
	}

	$stmt = $mysqli->prepare("
		SELECT c.Name AS Secretsanta, c.Image, c.Address FROM users u
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
	$output->santa = $row['Secretsanta'];
	$output->image = $row['Image'];
	$output->address = $row['Address'];

	// $child = array($row['Secretsanta'], $row['Image'], $row['Address']);

	echo json_encode($output);
?>