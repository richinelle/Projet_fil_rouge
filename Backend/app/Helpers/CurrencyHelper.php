<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format amount as currency
     *
     * @param float $amount
     * @param bool $includeSymbol
     * @return string
     */
    public static function format($amount, $includeSymbol = true)
    {
        $decimals = config('currency.decimals', 0);
        $symbol = config('currency.symbol', 'FCFA');

        $formatted = number_format($amount, $decimals, ',', ' ');

        if ($includeSymbol) {
            return "{$formatted} {$symbol}";
        }

        return $formatted;
    }

    /**
     * Get currency symbol
     *
     * @return string
     */
    public static function getSymbol()
    {
        return config('currency.symbol', 'FCFA');
    }

    /**
     * Get currency code
     *
     * @return string
     */
    public static function getCode()
    {
        return config('currency.code', 'XAF');
    }

    /**
     * Validate amount
     *
     * @param float $amount
     * @return bool
     */
    public static function isValid($amount)
    {
        return is_numeric($amount) && $amount > 0;
    }
}
