<?php

    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Http\Message\ResponseInterface as Response;

    $app->get('/api/history', function (Request $request, Response $response) {

        $db = require 'connect.php';
        $collection = $db->history;

        $output = new stdClass();

        $cursor = $collection->aggregate(
            [
                [
                    '$unwind'=> [
                        'path'=> '$years'
                    ]
                ], [
                    '$unwind'=> [
                        'path'=> '$years.gifts'
                    ]
                ], [
                    '$replaceRoot'=> [
                        'newRoot'=> '$years'
                    ]
                ], [
                    '$unwind'=> [
                        'path'=> '$gifts'
                    ]
                ], [
                    '$lookup'=> [
                        'from'=> 'users',
                        'localField'=> 'gifts.santaId',
                        'foreignField'=> 'userId',
                        'as'=> 'santaUser'
                    ]
                ], [
                    '$lookup'=> [
                        'from'=> 'users',
                        'localField'=> 'gifts.childId',
                        'foreignField'=> 'userId',
                        'as'=> 'childUser'
                    ]
                ], [
                    '$unwind'=> [
                        'path'=> '$santaUser'
                    ]
                ], [
                    '$unwind'=> [
                        'path'=> '$childUser'
                    ]
                ], [
                    '$project'=> [
                        'year'=> 1,
                        'location'=> 1,
                        'location_image'=> '$image',
                        'gift'=> '$gifts.gift',
                        'gift_image'=> '$gifts.image',
                        'santa'=> '$santaUser.firstName',
                        'child'=> '$childUser.firstName'
                    ]
                ], [
                    '$group'=> [
                        '_id'=> '$year',
                        'year'=> [
                            '$first'=> '$$ROOT.year'
                        ],
                        'location'=> [
                            '$first'=> '$$ROOT.location'
                        ],
                        'location_image'=> [
                            '$first'=> '$$ROOT.location_image'
                        ],
                        'gifts'=> [
                            '$push'=> [
                                'santa'=> '$$ROOT.santa',
                                'child'=> '$$ROOT.child',
                                'gift'=> '$$ROOT.gift',
                                'gift_image'=> '$$ROOT.gift_image'
                            ]
                        ]
                    ]
                ], [
                    '$project'=> [
                        '_id'=> 0
                    ]
                ]
            ]
        );
        $response->getBody()->write(json_encode(iterator_to_array($cursor)));
        return $response;
    });
