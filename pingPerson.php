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
    
    function get_email($sql) {
        
        global $mysqli;
        if (!$result = $mysqli->query($sql)) {
            echo "Error. Code 4";
            exit;
        }
        
        // check if any result is returned
        if ($result->num_rows !== 1) {
            echo "Error. Incorrect result.";
            exit;
        }
        
        $row = $result->fetch_assoc();
        return $row["Email"];
    }

    function send_email($email) {
        
       
        $email_subject = "A new question has been asked in Secret Santa chat!";

        $email_headers = "From: secretsanta@jovanilic.com\r\n";
        $email_headers .= "MIME-Version: 1.0\r\n";
        $email_headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

        $email_text = '<html><body>';
        $email_text .= '<p>Somebody asked you a question, go to <a href="https://secretsanta.jovanilic.com/santachat.html" target="_blank">SecretSanta</a> website and answer it!</p><br>';
        $email_text .= '<p>Merry shopping und Alles Gute zum Gechristmas :)</p>';
        $email_text .= '</body></html>';

        // use wordwrap() if lines are longer than 70 characters
        $email_text = wordwrap($email_text, 70);

        // send email
        mail($email, $email_subject, $email_text, $email_headers);

        echo 'Success. Email sent.';
        exit;
    }

    $xml = get_config('private/config.xml');
    $mysqli = connect($xml);
    
    $email = get_email("select Email from users where UserID = " . $_GET['person']);

    send_email($email);

    $mysqli->close();

    exit();
?>