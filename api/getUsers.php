<?php

    require '../private/connect.php';
    
    $output = new stdClass();
    
    get_users();

    $mysqli->close();

    exit;
    
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

?>