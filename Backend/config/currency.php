<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Currency Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the application currency (Cameroon - FCFA)
    |
    */

    'code' => env('CURRENCY_CODE', 'XAF'),
    'symbol' => env('CURRENCY_SYMBOL', 'FCFA'),
    'name' => env('CURRENCY_NAME', 'Franc CFA'),
    'country' => env('CURRENCY_COUNTRY', 'Cameroon'),
    'decimals' => env('CURRENCY_DECIMALS', 0),

    /*
    |--------------------------------------------------------------------------
    | Payment Methods
    |--------------------------------------------------------------------------
    |
    | Available payment methods in Cameroon
    |
    */

    'payment_methods' => [
        'card' => [
            'name' => 'Carte Bancaire',
            'description' => 'Paiement par carte bancaire',
        ],
        'om' => [
            'name' => 'Orange Money',
            'description' => 'Paiement via Orange Money',
        ],
        'mtn_money' => [
            'name' => 'MTN Money',
            'description' => 'Paiement via MTN Money',
        ],
    ],
];
