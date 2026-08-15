<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Bank Accounts (Panitia)
    |--------------------------------------------------------------------------
    |
    | Rekening resmi panitia untuk pembayaran pendaftaran. Tampil di halaman
    | sukses pendaftaran dan digunakan untuk membuat record pembayaran.
    |
    */

    'bank' => env('RUN_BANK', 'BCA'),

    'account_number' => env('RUN_ACCOUNT_NUMBER', '1234567890'),

    'account_name' => env('RUN_ACCOUNT_NAME', 'Panitia CV WIYATA AMERTA Business Run 2026'),

    'payment_hours' => (int) env('RUN_PAYMENT_HOURS', 24),

];
