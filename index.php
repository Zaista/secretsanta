<?php
    require 'vendor/autoload.php';

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Slim\Factory\AppFactory;

    # [START gae_slim_front_controller]
    $app = AppFactory::create();
    // $app->addRoutingMiddleware();
    // $app->addErrorMiddleware(true, true, true);

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/public/secretsanta.html'));
        return $response;
    });

    $app->get('/history', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/public/santahistory.html'));
        return $response;
    });

    $app->get('/friends', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/public/santafriends.html'));
        return $response;
    });

    $app->get('/chat', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/public/santachat.html'));
        return $response;
    });

    $app->get('/stats', function (Request $request, Response $response) {
        $response->getBody()->write(file_get_contents(__DIR__ . '/public/santastats.html'));
        return $response;
    });

    $app->run();
    # [END gae_slim_front_controller]