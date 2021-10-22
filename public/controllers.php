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

    $app->get('/friends', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santafriends.html'));
        return $response;
    });

    $app->get('/chat', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santachat.html'));
        return $response;
    });

    $app->get('/stats', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/santastats.html'));
        return $response;
    });

    $app->get('/{res}/{file}', function (Request $request, Response $response, $args) {
        $filePath = __DIR__ . '/' . $args['res'] . '/' . $args['file'];
    
        if (!file_exists($filePath)) {
            return $response->withStatus(404, 'File Not Found');
        }
    
        switch (pathinfo($filePath, PATHINFO_EXTENSION)) {
            case 'css':
                $mimeType = 'text/css';
                break;
    
            case 'js':
                $mimeType = 'application/javascript';
                break;

            case 'php':
                $mimeType = 'application/x-httpd-php';
                break;
    
            default:
                $mimeType = 'text/html';
        }
    
        $newResponse = $response->withHeader('Content-Type', $mimeType . '; charset=UTF-8');
    
        $newResponse->getBody()->write(file_get_contents($filePath));
    
        return $newResponse;
    });