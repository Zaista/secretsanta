<?php
    require __DIR__ . '/vendor/autoload.php';

    //  Load the application code.
    /** @var Slim\App $app */
    $app = require __DIR__ . '/public/app.php';
    require __DIR__ . '/public/controllers.php';

    // Bootstrap the slim framework to handle the request.
    $app->run();

    // [END gae_php_app_bootstrap]