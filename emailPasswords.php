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

                $email_headers = "From: secretsanta@jovanilic.com\r\n";
                $email_headers .= "MIME-Version: 1.0\r\n";
                $email_headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

                $email_text = '<html><head><style>' . 
                'table {' .
                    'max-width: 730px; ' .
                    'margin: 25px 0;' .
                    'box-shadow: 0 0 20px rgba(0, 0, 0, 0.15); }' .
                'table, th, td {' .
                    'border-collapse: collapse;' .
                    'font-size: 0.9em;' .
                    'font-family: sans-serif;' .
                    'min-width: 400px; }' .
                '.padds {' .
                    'padding: 12px 15px; }' .
                'th {' .
                    'background-color: #fc0000;' .
                    'color: #ffffff;' .
                    'text-align: left; }' .
                'tr {' .
                    'border-bottom: 1px solid #dddddd; }' .
                'tr:last-of-type {' .
                    'border-bottom: 2px solid #009879; }' .
                '</style></head><body>';
                $email_text .= '<table><tr><td colspan="2" style="overflow: hidden; max-height: 254px"><img src="https://secretsanta.jovanilic.com/resources/images/santa.jpg" style="width: calc(100% + 24px); position: relative; left: -12px"></td></tr>';
                $email_text .= '<tr><th class="padds">User:</th><td class="padds">' . $user . '</td></tr>';
                $email_text .= '<tr><th class="padds">Password:</th><td class="padds">' . $user_data["password"] . '</td></tr>';
                $email_text .= '<tr><th class="padds">Address:</th><td class="padds">' . $user_data["address"] . '</td></tr>';
                $email_text .= '<tr><td colspan="2" class="padds" style="text-align: center">Link to <a href="https://secretsanta.jovanilic.com" target="_blank">SecretSanta</a> webiste</td></tr>';
                $email_text .= '</table>';
                $email_text .= '<p>Merry shopping und Alles Gute zum Gechristmas :)</p>';
                $email_text .= '</body></html>';

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