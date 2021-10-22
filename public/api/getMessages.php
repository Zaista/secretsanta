<?php

    $mysqli = require '../../private/connect.php';
    
	$output = new stdClass();

    $sql = "SELECT c.Message, u.FirstName, c.Timestamp FROM chat c, users u WHERE c.UserID = u.UserID ORDER BY Timestamp";
    
    if (!$result = $mysqli->query($sql)) {
        $output->error = "Eror code 1";
        echo json_encode($output);
        exit;
    }
    
    if ($result->num_rows === 0) {
        $output->error = "Empty result.";
        echo json_encode($output);
        exit;
    }
    
    $messages = array();
    
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    echo json_encode($messages);

    $mysqli->close();

    exit;
?>