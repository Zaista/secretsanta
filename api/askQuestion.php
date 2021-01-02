<?php

    $output = new stdClass();
    $output->user_id = $_POST['user_id'];
    $output->message = $_POST['message'];

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
    
    function get_user_data() {
        
        global $mysqli, $output;

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
    }

    function post_message() {
        
        global $mysqli, $output;
        
        $stmt = $mysqli->prepare('INSERT INTO chat(Message, Timestamp, UserID) VALUES (?, NOW(), ' . $output->user_id . ')');

        $stmt->bind_param('s', $output->message);
        $stmt->execute();
        $result = $stmt->get_result();

        $output->result = "Message posted.";
    }

    function send_email() {
        
        global $output;
        
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
    }

    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);
    
    get_user_data();

    post_message();

    send_email();

    $mysqli->close();

    exit;
?>