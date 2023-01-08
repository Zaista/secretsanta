<?php

    use Google\Cloud\SecretManager\V1\SecretManagerServiceClient;

    if (empty($_ENV['GAE_ENV'])) {
        // local environment
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();

        $client = new MongoDB\Client("mongodb://${_ENV['username']}:${_ENV['password']}@${_ENV['hostname']}");
        $db = $client->{$_ENV['database']};

        return $db;
    } else {
        // production environment
        $data = new stdClass();
        $projectId = 'deductive-span-313911';
        $versionId = 'latest';
        
        // Create the Secret Manager client.
        $client = new SecretManagerServiceClient();
    
        // Build the resource name of the secret version.
        $name = $client->secretVersionName($projectId, 'sql-hostname', $versionId);
        $secret = $client->accessSecretVersion($name);
        $data->hostname = $secret->getPayload()->getData();

        $name = $client->secretVersionName($projectId, 'sql-username', $versionId);
        $secret = $client->accessSecretVersion($name);
        $data->username = $secret->getPayload()->getData();

        $name = $client->secretVersionName($projectId, 'sql-password', $versionId);
        $secret = $client->accessSecretVersion($name);
        $data->password = $secret->getPayload()->getData();

        $name = $client->secretVersionName($projectId, 'sql-database', $versionId);
        $secret = $client->accessSecretVersion($name);
        $data->database = $secret->getPayload()->getData();
        return connect($data);
    }

    function connect($xml)
    {
        $mysqli = new mysqli($xml->hostname, $xml->username, $xml->password, $xml->database);
        
        if ($mysqli->connect_error) {
            $output->error = "Connection failed: " . $mysqli->connect_error;
            echo json_encode($output);
            exit;
        }

        // this will make sure cyrilic letters are displayed properly
        $mysqli->query("SET NAMES utf8");

        return $mysqli;
    }
