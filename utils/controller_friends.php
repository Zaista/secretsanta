<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/api/friends', function (Request $request, Response $response) {
        $mysqli = require 'connect.php';
    
        $output = new stdClass();

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
        
        $response->getBody()->write(json_encode($users));
        return $response;
    });
