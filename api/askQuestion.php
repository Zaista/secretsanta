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

    function post_message() {
        
        global $mysqli, $output;
        
        $stmt = $mysqli->prepare("INSERT INTO chat(Message, Timestamp) VALUES (?, NOW())");

        $message = $_POST['message'];
        $stmt->bind_param('s', $message);
        $stmt->execute();
        $result = $stmt->get_result();

        $output->post = "Message sent.";
    }
    
    function get_email($sql) {
        
        global $mysqli, $output;

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

        return $row["Email"];
    }

    function send_email($email) {
        
        global $output;
        
        $email_subject = "A new question has been asked in Secret Santa chat!";

        $email_headers = "From: secretsanta@jovanilic.com\r\n";
        $email_headers .= "MIME-Version: 1.0\r\n";
        $email_headers .= "Content-Type: text/html; charset=utf-8\r\n";

        $email_text = '<html><body>';
        $email_text .= '<p>Somebody asked you a question:</p>';
        $email_text .= '<p>' . $_POST['message'] . '</p><br>';
        $email_text .= '<p>Go to <a href="https://secretsanta.jovanilic.com/santachat.html" target="_blank">SecretSanta</a> website and answer it!</p>';
        $email_text .= '<p>Merry shopping und Alles Gute zum Gechristmas :)</p>';
        $email_text .= '</body></html>';

        // use wordwrap() if lines are longer than 70 characters
        $email_text = wordwrap($email_text, 70);

        // send email
        mail($email, $email_subject, $email_text, $email_headers);

        $output->email = "Email sent.";
        echo json_encode($output);
    }

    $xml = get_config('../private/config.xml');
    $mysqli = connect($xml);

    post_message();
    
    $email = get_email("select Email from users where UserID = " . $_POST['person']);

    send_email($email);

    $mysqli->close();

    exit;
?>