<?php

namespace App\Enums;

enum RegistrationStatus: string
{
    case PendingPayment = 'pending_payment';
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PendingPayment => 'Belum Bayar',
            self::PendingVerification => 'Menunggu Verifikasi',
            self::Verified => 'Lunas',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
