<?php
	// DATABASE CONNECTION
	$hostname = 'db18.cpanelhosting.rs';
	$username = 'aven_santa';
	$password = 'Aven.021';
	$database = 'aven_secretsanta';

	$mysqli = new mysqli($hostname, $username, $password, $database);

	// check connection
	if ($mysqli->connect_error) {
		die("Connection failed: " . $mysqli->connect_error);
	}

	// this will make sure cyrilic letters are displayed properly
	$mysqli->query("SET NAMES utf8");

    // HOW TO SANTA

    // 1. prepare two chirstmas buckets, one for people, and one for naughty pairs
    $people = array();
    $naughties = array();

    // 2. get an empty list where you will write secret santa pairs
    $santas = array();

    // 3. prepare to match up santas and children randomly
    function christmas_match_up() {

        // 4. fetch the people bucket
        global $people, $naughties, $mysqli, $test;

		// empty the buckets
		$sql = "DELETE FROM matches";
		$mysqli->query($sql);

        // 5. put the names in the people buket
        $people = array();
        $test = array();

		$sql = "SELECT UserID, Username FROM users";
		if (!$result = $mysqli->query($sql)) {

			echo "Error. Code 1";
			exit;

		} else if ($result->num_rows === 0) {

			echo "Error. Code 2";
			exit;

		} else {

			while ($row = $result->fetch_assoc()) {

				array_push($people,$row['UserID']);
				$test[$row['UserID']] = $row['Username'];
			}
		}

        // 6. put naughty pairs in the naughties bucket
        $naughties = array();

		$sql = "SELECT User1ID, User2ID FROM forbidden";
		if (!$result = $mysqli->query($sql)) {

			echo "Error. Code 3";
			exit;

		} else if ($result->num_rows === 0) {

			echo "Error. Code 4";
			exit;

		} else {

			while ($row = $result->fetch_assoc()) {

				$naughties[$row['User1ID']] = $row['User2ID'];
			}
		}

        // 7. fetch the christmas buckets
        global $santas, $people;

        // 8. pick a name out of the people bucket and remember it
        $first = $santa = array_shift($people);

        while(count($people)) {

            // 9. pick another name out of the people bucket
            $child = array_splice($people, array_rand($people), 1)[0];

            // 10. write these two in the santas list, first name is santa, second name is child
            $santas[$santa] = $child;

            // 11. now this child will become santa to someone else
            $santa = $child;

            // 12. repeat from steps 9 to 12 until all names are drawn from the people bucket
        }

        // 13. pair up the last drawn santa, and set the first drawn name as its child
        $santas[$santa] = $first;
    }

    // 14. prepare to check if your list is naughty
    function validate_naughtiness() {

        // 15. fetch the santas list and the naughty bucket
        global $naughties, $santas;

        // 16. if santas list is empty, you've clearly messed up something, bang yourself on the head
        if (count($santas) == 0)
            return false;

        // 17. pick up a single pair out of the naughty bucket
        foreach ($naughties as $pair_1 => $pair_2) {

            // 18. go through the santas list
            foreach ($santas as $santa => $child) {

				// 19. if a pair in the list matches the pair picked from the bucket, bang yourself on the head
				if (($santa == $pair_1 && $child == $pair_2) || ($santa == $pair_2 && $child == $pair_1)) {
					return false;
				}
			}
        }

        // 20. if you reached this step, your list is not naughty
        return true;
    }

    // 21. try to remember if you've banged yourself in the head?
    while (validate_naughtiness() != true) {

        // 22. if you did, well you have to start everything from the step 3
        christmas_match_up();
    }

	/* // this is for test
	$test2 = array_keys($santas);
	for ($i = 0; $i < sizeof($santas); $i++) {
		echo $test[$test2[$i]] . ' -> ' . $test[$santas[$test2[$i]]] . '<br>';
	} */

    // 23. when you stop banging your head, behold, the naughtiless santa pairs (add them to database)
	$match = [];
	$iterator = 1;
	foreach ($santas as $santa => $child) {
		$match[] = "(" . $iterator++ . ", $santa, $child)";
	}
	$match_to_sql = implode(',', $match);
	$sql = 'INSERT INTO matches (MatchID, SantaID, ChildID) VALUES ' . $match_to_sql;
	//echo $sql;

	if (!$result = $mysqli->query($sql)) {

		echo "Error. Code 5";
		exit;

	} else if ($mysqli->affected_rows == 0) {

		echo "Error. Code 6";
		exit;
	}

	echo "Secret Santa paris have been matched successfully!";
?>
