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
    
    function get_users() {
        
        global $mysqli, $output;

        $sql = "SELECT FirstName, LastName, Email, Username, Address FROM users WHERE Active != 0";

        if (!$result = $mysqli->query($sql)) {
            $output->error = "Eror reading the database.";
            echo json_encode($output);
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows === 0) {
            $output->error = "Empty result from database.";
            echo json_encode($output);
            exit;
        }

        $users = array();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    
        echo json_encode($users);
    }
    
    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);
    
    get_users();

    //$result->free();
    $mysqli->close();

    exit;
?>