<?php

return [

    // 🔥 Routes concernées par CORS
    'paths' => ['api/*'],

    // 🔥 Autoriser toutes les méthodes (GET, POST, PUT, DELETE…)
    'allowed_methods' => ['*'],

    // 🔥 Autoriser ton frontend React
    'allowed_origins' => ['http://localhost:3000'],

    // 🔥 Pas nécessaire ici
    'allowed_origins_patterns' => [],

    // 🔥 Autoriser tous les headers (important pour axios)
    'allowed_headers' => ['*'],

    // 🔥 Pas obligatoire
    'exposed_headers' => [],

    // 🔥 Cache du preflight (0 = pas de cache)
    'max_age' => 0,

    // 🔥 IMPORTANT : mettre false pour éviter les erreurs CORS
    'supports_credentials' => false,

];
