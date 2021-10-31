<?php
    require __DIR__ . '/vendor/autoload.php';

    //  Load the application code.
    /** @var Slim\App $app */
    $app = require __DIR__ . '/utils/app.php';
    require __DIR__ . '/utils/controllers.php';
    require __DIR__ . '/utils/controller_santa.php';
    require __DIR__ . '/utils/controller_history.php';
    require __DIR__ . '/utils/controller_friends.php';
    require __DIR__ . '/utils/controller_chat.php';
    require __DIR__ . '/utils/controller_match.php';
    require __DIR__ . '/utils/controller_email.php';

    // Bootstrap the slim framework to handle the request.
    $app->run();

    // [END gae_php_app_bootstrap]