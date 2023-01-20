<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/api/match', function (Request $request, Response $response) {
        $GLOBALS['mysqli'] = require 'connect.php';
    
        $output = new stdClass();

        if (empty($_GET['password'])) {
            $output->error = "Username or password not set.";
            $response->getBody()->write(json_encode($output));
            return $response;
        }

        if ($_GET['password'] != 'santa_seed') {
            $output->error = "Wrong password.";
            $response->getBody()->write(json_encode($output));
            return $response;
        }
        $GLOBALS['output'] = $output;
    
        // HOW TO SANTA

        // 1. prepare two Christmas buckets, one for people, and one for naughty pairs
        $GLOBALS['people'] = array();
        $GLOBALS['naughties'] = array();

        // 2. get an empty list where you will write secret santa pairs
        $GLOBALS['santas'] = array();

        // 3. prepare to match up santas and children randomly
        function christmas_match_up()
        {
            // 4. fetch the people bucket
            $people = $GLOBALS['people'];
            $naughties = $GLOBALS['naughties'];
            $mysqli = $GLOBALS['mysqli'];
            $santas = $GLOBALS['santas'];

            // empty the bucket
            $sql = "DELETE FROM matches";
            $mysqli->query($sql);

            // 5. put the names in the people bucket
            $people = array();

            $sql = "SELECT UserID, Username FROM users WHERE Active != 0";
        
            if (!$result = $mysqli->query($sql)) {
                $output->error = "Error code 1.";
                $response->getBody()->write(json_encode($output));
                return $response;
            } elseif ($result->num_rows === 0) {
                $output->error = "Error code 2.";
                $response->getBody()->write(json_encode($output));
                return $response;
            } else {
                while ($row = $result->fetch_assoc()) {
                    array_push($people, $row['UserID']);
                }
            }

            // 6. put naughty pairs in the naughties bucket
            $naughties = array();

            $sql = "SELECT User1ID, User2ID FROM forbidden";
        
            if (!$result = $mysqli->query($sql)) {
                $output->error = "Error code 3.";
                $response->getBody()->write(json_encode($output));
                return $response;
            } elseif ($result->num_rows === 0) {
                $output->error = "Error code 4";
                $response->getBody()->write(json_encode($output));
                return $response;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $naughties[$row['User1ID']] = $row['User2ID'];
                }
            }

            // 7. pick a name out of the people bucket and remember it
            $first = $santa = array_shift($people);

            while (count($people)) {

                // 8. pick another name out of the people bucket
                $child = array_splice($people, array_rand($people), 1)[0];

                // 9. write these two in the santas list, first name is santa, second name is child
                $santas[$santa] = $child;

                // 10. now this child will become santa to someone else
                $santa = $child;

                // 11. repeat from steps 8 to 10 until all names are drawn from the people bucket
            }

            // 12. pair up the last drawn santa, and set the first drawn name as its child
            $santas[$santa] = $first;
            $GLOBALS['santas'] = $santas;
            $GLOBALS['naughties'] = $naughties;
        }

        // 13. prepare to check if your list is naughty
        function validate_naughtiness()
        {
            // 14. fetch the santas list and the naughty bucket
            $naughties = $GLOBALS['naughties'];
            $santas = $GLOBALS['santas'];
            $mysqli = $GLOBALS['mysqli'];

            // 15. if santas list is empty, you've clearly messed up something, bang yourself on the head
            if (count($santas) == 0) {
                return false;
            }

            // 16. pick up a single pair out of the naughty bucket
            foreach ($naughties as $pair_1 => $pair_2) {

                // 17. go through the santas list
                foreach ($santas as $santa => $child) {

                    // 18. if a pair in the list matches the pair picked from the bucket, bang yourself on the head
                    if (($santa == $pair_1 && $child == $pair_2) || ($santa == $pair_2 && $child == $pair_1)) {
                        return false;
                    }
                }
            }

            // 19. if you reached this step, your list is not naughty
            return true;
        }

        // 20. try to remember if you've banged yourself in the head?
        $limit = 0;
        while (validate_naughtiness() != true) {
            if ($limit > 20) {
                $output->error = "Matching attempts limit reached.";
                $response->getBody()->write(json_encode($output));
                return $response;
            }

            // 21. if you did, well you have to start everything from the step 3
            christmas_match_up();
            $limit++;
        }

        // 22. when you stop banging your head, behold, the naughtiless santa pairs (add them to database)
        $match = [];
        $iterator = 1;
        $santas = $GLOBALS['santas'];
        $mysqli = $GLOBALS['mysqli'];
    
        foreach ($santas as $santa => $child) {
            $match[] = "(" . $iterator++ . ", $santa, $child)";
        }
    
        $match_to_sql = implode(',', $match);
        $sql = 'INSERT INTO matches (MatchID, SantaID, ChildID) VALUES ' . $match_to_sql;

        if (!$result = $mysqli->query($sql)) {
            $output->error = "Error code 5.";
            $response->getBody()->write(json_encode($output));
            return $response;
        } elseif ($mysqli->affected_rows == 0) {
            $output->error = "Error code 6.";
            $response->getBody()->write(json_encode($output));
            return $response;
        }

        $output->match = "Secret Santa paris have been rematched successfully.";
        $response->getBody()->write(json_encode($output));
        return $response;
    });
