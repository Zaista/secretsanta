<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/api/email', function (Request $request, Response $response) {
        $GLOBALS['mysqli'] = require 'private/connect.php';

        $GLOBALS['output'] = new stdClass();
            
        $GLOBALS['users'] = array();
            
        function get_emails()
        {
            $mysqli = $GLOBALS['mysqli'];
            $output = $GLOBALS['output'];

            if (empty($_GET['person'])) {
                $stmt = $mysqli->prepare("SELECT Username, Password, Email, Address FROM users WHERE Active != 0");
            } else {
                $stmt = $mysqli->prepare("SELECT Username, Password, Email, Address FROM users WHERE UserID = ?");
                $stmt->bind_param('s', $_GET['person']);
            }

            $stmt->execute();
                
            if (!$result = $stmt->get_result()) {
                $output->error = "Error code 4.";
                $response->getBody()->write(json_encode($output));
                return $response;
            }
                
            // check if any result is returned
            if ($result->num_rows === 0) {
                $output->error = "No emails were found.";
                $response->getBody()->write(json_encode($output));
                return $response;
            }
                
            while ($row = $result->fetch_assoc()) {
                $temp = array();
                $temp["password"] = $row["Password"];
                $temp["email"] = $row["Email"];
                $temp["address"] = $row["Address"];
                    
                $users =  $GLOBALS['users'];
                $users[$row["Username"]] = $temp;
            }
            $GLOBALS['users'] = $users;
        }

        function send_emails()
        {
            $output = $GLOBALS['output'];
            $users = $GLOBALS['users'];
            foreach ($users as $user => $user_data) {
                if ($user_data["email"] != null) {
                    $email_subject = "How to access your super neat Secret Santa place";

                    $email_headers = "From: ilicjovan89@gmail.com\r\n";
                    $email_headers .= "MIME-Version: 1.0\r\n";
                    $email_headers .= "Content-Type: text/html; charset=utf-8\r\n";

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
                    if(!mail($user_data["email"], $email_subject, $email_text, $email_headers)) {
                        $output->error = "Error with email server.";
                        $GLOBALS['output'] = $output;
                        return;
                    }
                }
            }

            $output->success = "Emails with usernames and passwords are sent out.";
            $GLOBALS['output'] = $output;
        }
            
        get_emails();
        send_emails();

        $response->getBody()->write(json_encode($GLOBALS['output']));
        return $response;
    });
