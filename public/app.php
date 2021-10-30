<?php

    /**
     * Create a new Slim PHP Application.  Configure it for debugging.
     */
    use Slim\Factory\AppFactory;

    $app = AppFactory::create();
    $app->addRoutingMiddleware();
    // Display errors
    $app->addErrorMiddleware(true, true, true);

    return $app;