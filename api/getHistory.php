<?php

    $output = new stdClass();

    function connect($xml)
    {
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

    function get_config($config)
    {
        // load configuration file
        $xml = simplexml_load_file($config) or die("Error: Cannot load configuration file");
        return $xml;
    }
    
    function execute_sql()
    {
        global $mysqli, $output;

        $sql = "SELECT Year, Label, Image FROM year";

        if (!$result = $mysqli->query($sql)) {
            $output->error = "Eror code 4.";
            echo json_encode($output);
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows === 0) {
            $output->error = "Empty result from database.";
            echo json_encode($output);
            exit;
        }
        
        while ($row = $result->fetch_assoc()) {
            $temp = array();
            $temp["label"] = $row["Label"];
            $temp["image"] = $row["Image"];
            
            $history[$row["Year"]] = $temp;
        }
    }
    
    function execute_sql2()
    {
        global $mysqli, $output;

        $sql = "SELECT year.Year, year.Label, year.Image as YearImage, santa.Username, santa.FirstName as Santa, child.FirstName as Child, archive.Gift, archive.Image as GiftImage FROM archive
        INNER JOIN users AS santa ON archive.SantaID = santa.UserID
        INNER JOIN users AS child ON archive.ChildID = child.UserID
        INNER JOIN year ON archive.YearID = year.YearID;";

        if (!$result = $mysqli->query($sql)) {
            $output->error = "Eror code 5.";
            echo json_encode($output);
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows === 0) {
            $output->error = "Empty result from database, code 2.";
            echo json_encode($output);
            exit;
        }
        
        $years = array();
        while ($row = $result->fetch_assoc()) {
            $year = new stdClass();
            $year->santa = $row["Santa"];
            $year->child = $row["Child"];
            $year->gift = $row["Gift"];
            $year->image = $row["GiftImage"];
            $year->year = $row["Year"];

            $year_name = $row["Year"];
            $years[$row["Year"]]["gifts"][] = $year;
            $years[$row["Year"]]["label"] = $row["Label"];
            $years[$row["Year"]]["image"] = $row["YearImage"];
        }
    
        echo json_encode($years);
    }
    
    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);
    
    execute_sql();
    
    execute_sql2();

    //$result->free();
    $mysqli->close();

    exit;
