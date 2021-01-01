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
    
    function execute_sql($sql) {
        
        global $mysqli;
        if (!$result = $mysqli->query($sql)) {
            echo "Error. Code 4";
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows === 0) {
            echo "Error. Empty result."; 
            exit;
        }
        
        while ($row = $result->fetch_assoc()) {
            
            $temp = array();
            $temp["label"] = $row["Label"];
            $temp["image"] = $row["Image"];
            
            global $history;
            $history[$row["Year"]] = $temp;
        }
    }
    
    function execute_sql2($sql) {
        
        global $mysqli;

        if (!$result = $mysqli->query($sql)) {
            echo "Error. Code 4";
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows === 0) {
            echo "Error. Empty result.";
            exit;
        }
        
        while ($row = $result->fetch_assoc()) {
            
            global $history;
            $history[$row["Year"]][] = $row;
        }
    }
    
    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);
    
    $history = array();
    
    execute_sql("SELECT Year, Label, Image FROM year");
    
    execute_sql2("SELECT year.Year, santa.Name as Santa, child.Name as Child, archive.Gift, archive.Image FROM archive
        INNER JOIN users AS santa ON archive.SantaID = santa.UserID
        INNER JOIN users AS child ON archive.ChildID = child.UserID
        INNER JOIN year ON archive.YearID = year.YearID;");
    
    echo json_encode($history, JSON_UNESCAPED_UNICODE);

    //$result->free();
    $mysqli->close();

    exit;
?>