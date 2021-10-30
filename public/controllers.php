<?php

    /*
    * Adds all the controllers to Slim PHP $app.
    */
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/secretsanta.html'));
        return $response;
    });

    $app->get('/history', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santahistory.html'));
        return $response;
    });

    $app->get('/api/getHistory.php', function (Request $request, Response $response) {
        $mysqli = require __DIR__ . '/../private/connect.php';
    
        $output = new stdClass();
        
        function load_history()
        {
            global $mysqli, $output;

            $sql = "SELECT year.Year, year.Label, year.Image as YearImage, santa.Username, santa.FirstName as Santa, child.FirstName as Child, archive.Gift, archive.Image as GiftImage FROM archive
            INNER JOIN users AS santa ON archive.SantaID = santa.UserID
            INNER JOIN users AS child ON archive.ChildID = child.UserID
            INNER JOIN year ON archive.YearID = year.YearID;";

            if (!$result = $mysqli->query($sql)) {
                $output->error = "Eror code 5.";
                echo json_encode($output);
                exit;
            }
            
            // check if any result is returned
            if ($result->num_rows === 0) {
                $output->error = "Empty result from database, code 2.";
                echo json_encode($output);
                exit;
            }
            
            $years = array();
            while ($row = $result->fetch_assoc()) {
                $year = new stdClass();
                $year->santa = $row["Santa"];
                $year->child = $row["Child"];
                $year->gift = $row["Gift"];
                $year->image = $row["GiftImage"];
                $year->year = $row["Year"];

                $year_name = $row["Year"];
                $years[$row["Year"]]["gifts"][] = $year;
                $years[$row["Year"]]["label"] = $row["Label"];
                $years[$row["Year"]]["image"] = $row["YearImage"];
            }
        
            echo json_encode($years);
        }
        
        load_history();

        //$result->free();
        $mysqli->close();

        exit;
    });

    $app->get('/friends', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santafriends.html'));
        return $response;
    });

    $app->get('/chat', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santachat.html'));
        return $response;
    });

    $app->get('/resources/images/{file}', function (Request $request, Response $response, $args) {
        $filePath = __DIR__ . '/resources/images/' . $args['file'];
        $newResponse = $response->withHeader('Content-Type', 'text/html; charset=UTF-8');
        $newResponse->getBody()->write(file_get_contents($filePath));
        return $newResponse;
    });

    $app->get('/resources/favicon.ico', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/resources/favicon.ico'));
        return $response;
    });

    $app->get('/stats', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santastats.html'));
        return $response;
    });

    $app->get('/js/{file}', function (Request $request, Response $response, $args) {
        $filePath = __DIR__ . '/js/' . $args['file'];
        $newResponse = $response->withHeader('Content-Type', 'application/javascript; charset=UTF-8');
        $newResponse->getBody()->write(file_get_contents($filePath));
        return $newResponse;
    });

    $app->get('/css/{file}', function (Request $request, Response $response, $args) {
        $filePath = __DIR__ . '/css/' . $args['file'];
        $newResponse = $response->withHeader('Content-Type', 'text/css; charset=UTF-8');
        $newResponse->getBody()->write(file_get_contents($filePath));
        return $newResponse;
    });
    
    // $app->get('/{res}/{file}', function (Request $request, Response $response, $args) {
    //     $filePath = __DIR__ . '/' . $args['res'] . '/' . $args['file'];
    
    //     if (!file_exists($filePath)) {
    //         return $response->withStatus(404, 'File Not Found');
    //     }
    
    //     switch (pathinfo($filePath, PATHINFO_EXTENSION)) {
    //         case 'css':
    //             $mimeType = 'text/css';
    //             break;
    
    //         case 'js':
    //             $mimeType = 'application/javascript';
    //             break;

    //         case 'php':
    //             $mimeType = 'application/x-httpd-php';
    //             break;
    
    //         default:
    //             $mimeType = 'text/html';
    //     }
    
    //     $newResponse = $response->withHeader('Content-Type', $mimeType . '; charset=UTF-8');
    
    //     $newResponse->getBody()->write(file_get_contents($filePath));
    
    //     return $newResponse;
    // });