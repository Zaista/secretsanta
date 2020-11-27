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
    
    function get_emails($sql) {
        
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
            $temp["password"] = $row["Password"];
            $temp["email"] = $row["Email"];
            $temp["address"] = $row["Address"];
            
            global $users;
            $users[$row["Username"]] = $temp;
        }
    }

    function send_emails() {
        
        global $users;
        foreach ($users as $user => $user_data) {
            if ($user_data["email"] != null) {
                $email_subject = "How to access your super neat Secret Santa place";
                $email_text = '
Secret Santa super secret info:
    secret_santa_username: ' . $user . '
    santa_super_password: ' . $user_data["password"] . '
    secret_not_so_secret_address: ' . $user_data["address"] . '
    super_public_link: https://secretsanta.jovanilic.com

Merry shopping und Alles Gute zum Gechristmas :)';

                $email_headers = "From: secretsanta@jovanilic.com";

                // use wordwrap() if lines are longer than 70 characters
                $email_text = wordwrap($email_text, 70);

                // send email
                mail($user_data["email"], $email_subject, $email_text, $email_headers);
            }
        }

        echo 'Success. Emails with usernames and passwords are sent out.';
        exit;
    }

    $xml = get_config('private/config.xml');
    $mysqli = connect($xml);
    
    $users = array();
    
    get_emails("SELECT Username, Password, Email, Address FROM users where Active != 0");

    send_emails();

    $mysqli->close();

    exit();
?>