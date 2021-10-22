<?php
    require_once __DIR__ . '/vendor/autoload.php';

    //  Load the application code.
    /** @var Slim\App $app */
    $app = require __DIR__ . '/public/app.php';
    require __DIR__ . '/public/controllers.php';

    // Bootstrap the slim framework to handle the request.
    $app->run();

    // [END gae_php_app_bootstrap]

    // use Psr\Http\Message\ResponseInterface as Response;
    // use Psr\Http\Message\ServerRequestInterface as Request;
    // use Slim\Factory\AppFactory;

    // $app = AppFactory::create();
    // $app->addRoutingMiddleware();
    // $app->addErrorMiddleware(true, true, true);
    // $app->setBasePath("/index.php");

    

    // $app->run();