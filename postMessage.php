<?php

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

	$xml = get_config('private/config.xml');
	$mysqli = connect($xml);

	$stmt = $mysqli->prepare("INSERT INTO chat(Message, Timestamp) VALUES (?, NOW())");

	$message = $_POST['message'];
    $stmt->bind_param('s', $message);
    $stmt->execute();
    $result = $stmt->get_result();

    echo "success";

    $mysqli->close();

    exit();
?>