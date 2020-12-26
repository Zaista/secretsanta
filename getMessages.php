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

    $sql = "SELECT * FROM chat ORDER BY Timestamp";
    
    if (!$result = $mysqli->query($sql)) {
        echo "Error. Code 1";
        exit;
    }
    
    // check if any result is returned
    if ($result->num_rows === 0) {
        echo "Error. Empty result.";
        exit;
    }
    
    $messages = array();
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    echo json_encode($messages, JSON_UNESCAPED_UNICODE);

    $mysqli->close();

    exit();
?>