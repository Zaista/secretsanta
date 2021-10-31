<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/secretsanta.html'));
        return $response;
    });

    $app->get('/history', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/santahistory.html'));
        return $response;
    });

    $app->get('/friends', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/santafriends.html'));
        return $response;
    });

    $app->get('/chat', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/santachat.html'));
        return $response;
    });

    $app->get('/favicon.ico', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/favicon.ico'));
        return $response;
    });

    $app->get('/stats', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents('public/santastats.html'));
        return $response;
    });

    $app->get('/js/{file}', function (Request $request, Response $response, $args) {
        $filePath = 'public/js/' . $args['file'];
        $newResponse = $response->withHeader('Content-Type', 'application/javascript; charset=UTF-8');
        $newResponse->getBody()->write(file_get_contents($filePath));
        return $newResponse;
    });

    $app->get('/css/{file}', function (Request $request, Response $response, $args) {
        $filePath = 'public/css/' . $args['file'];
        $newResponse = $response->withHeader('Content-Type', 'text/css; charset=UTF-8');
        $newResponse->getBody()->write(file_get_contents($filePath));
        return $newResponse;
    });

    // used to serve static files in local development
    if (php_sapi_name() == 'cli-server') {
        $app->get('/resources/images/[{year}[/{file}]]', function (Request $request, Response $response, $args) {
            if (!empty($args['file'])) {
                $filePath = 'public/resources/images/' . $args['year'] . '/' . $args['file'];
            } else  {
                $filePath = 'public/resources/images/' . $args['year'];
            }
            $newResponse = $response->withHeader('Content-Type', 'text/css; charset=UTF-8');
            $newResponse->getBody()->write(file_get_contents($filePath));
            return $newResponse;
        });
    }
