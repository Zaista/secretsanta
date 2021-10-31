<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/api/chat', function (Request $request, Response $response) {
        $mysqli = require 'connect.php';
    
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
        
        $response->getBody()->write(json_encode($messages));
        return $response;
    });

    $app->post('/api/chat', function (Request $request, Response $response) {
        $mysqli = require 'connect.php';

        $output = new stdClass();
        $output->user_id = $_POST['chatUserID'];
        $output->message = $_POST['chatMessage'];
    
        // get user data
        $sql = "select Username, Email from users where UserID = " . $output->user_id;

        if (!$result = $mysqli->query($sql)) {
            $output->error = "Eror code 4";
            echo json_encode($output);
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows !== 1) {
            $output->error = "Database problems.";
            echo json_encode($output);
            exit;
        }
        
        $row = $result->fetch_assoc();
        
        if (empty($row["Email"])) {
            $output->error = "Email not found.";
            echo json_encode($output);
            exit;
        }

        $output->email = $row["Email"];
        $output->username = $row["Username"];

        // post message
        
        $stmt = $mysqli->prepare('INSERT INTO chat(Message, Timestamp, UserID) VALUES (?, NOW(), ' . $output->user_id . ')');

        $stmt->bind_param('s', $output->message);
        $stmt->execute();
        $result = $stmt->get_result();

        $output->result = "Message posted.";

        // send email
        $email_subject = "A new question has been asked in Secret Santa chat!";

        $email_headers = "From: secretsanta@jovanilic.com\r\n";
        $email_headers .= "MIME-Version: 1.0\r\n";
        $email_headers .= "Content-Type: text/html; charset=utf-8\r\n";

        $email_text = '<html><body>';
        $email_text .= '<p>Somebody asked you a question:</p>';
        $email_text .= '<p>' . $output->message . '</p><br>';
        $email_text .= '<p>Go to <a href="https://secretsanta.jovanilic.com/santachat.html" target="_blank">SecretSanta</a> website and answer it!</p>';
        $email_text .= '<p>Merry shopping und Alles Gute zum Gechristmas :)</p>';
        $email_text .= '</body></html>';

        // use wordwrap() if lines are longer than 70 characters
        $email_text = wordwrap($email_text, 70);

        // send email
        mail($output->email, $email_subject, $email_text, $email_headers);

        $output->result = "Message posted in chat and email sent to the selected person.";
        echo json_encode($output);

        $response->getBody()->write(json_encode($output));
        return $response;
    });
