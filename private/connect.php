<?php

    function get_config($config) {

        $xml = simplexml_load_file($config);
        return $xml;
    }

    function connect($xml) {
        
        global $output;
        
        $mysqli = new mysqli($xml->database->hostname, $xml->database->username, $xml->database->password, $xml->database->database);
        
        if ($mysqli->connect_error) {
            $output->error = "Connection failed: " . $mysqli->connect_error;
            echo json_encode($output);
            exit;
        }

        // this will make sure cyrilic letters are displayed properly
        $mysqli->query("SET NAMES utf8");

        return $mysqli;
    }

    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);
    
?>