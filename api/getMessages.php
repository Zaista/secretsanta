<?php

	$output = new stdClass();

    function connect($xml) {
        
        global $output;

        // create connection
        $mysqli = new mysqli($xml->database->hostname, $xml->database->username, $xml->database->password, $xml->database->database);
        // check connection
        if ($mysqli->connect_error) {
            $output->error = "Connection failed: " . $mysqli->connect_error;
            echo json_encode($output);
            exit;
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

    $sql = "SELECT c.Message, u.Name, c.Timestamp FROM chat c, users u WHERE c.UserID = u.UserID ORDER BY Timestamp";
    
    if (!$result = $mysqli->query($sql)) {
        $output->error = "Eror code 1";
        echo json_encode($output);
        exit;
    }
    
    // check if any result is returned
    if ($result->num_rows === 0) {
        $output->error = "Empty result.";
        echo json_encode($output);
        exit;
    }
    
    $messages = array();
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    echo json_encode($messages, JSON_UNESCAPED_UNICODE);

    $mysqli->close();

    exit;
?>