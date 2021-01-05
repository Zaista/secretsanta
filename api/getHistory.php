<?php

    require '../private/connect.php';
    
    $output = new stdClass();
    
    load_history();

    //$result->free();
    $mysqli->close();

    exit;
    
    function load_history()
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

?>
