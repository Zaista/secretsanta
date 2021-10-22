<?php

    /**
     * Create a new Slim PHP Application with Twig.  Configure it for debugging.
     */
    use DI\Container;
    use Google\Cloud\Samples\AppEngine\GettingStarted\CloudSqlDataModel;
    // [START gae_php_app_storage_client_import]
    use Google\Cloud\Storage\StorageClient;

    // [END gae_php_app_storage_client_import]
    use Slim\Factory\AppFactory;
    // use Slim\Views\Twig;

    // AppFactory::setContainer($container = new Container());

    $app = AppFactory::create();

    // Display errors
    $app->addErrorMiddleware(true, true, true);

    return $app;