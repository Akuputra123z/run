<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #141414; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #141414; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #FFF6E5; border-radius: 18px; overflow: hidden;">
                    <tr>
                        <td style="background: #C6242D; padding: 28px 32px;">
                            <div style="font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #FFF6E5;">CV WIYATA AMERTA <span style="color: #FFC93C;">BUSINESS RUN</span> 2026</div>
                            <div style="font-size: 12px; color: rgba(255,246,229,0.8); margin-top: 4px;">Pantai Karang Jahe · Rembang · 15 November 2026</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 32px;">
                            <h1 style="margin: 0 0 16px; font-size: 20px; color: #141414;">{{ $emailSubject }}</h1>

                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #333;">Halo <strong>{{ $registration->name }}</strong>,</p>
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #333;">
                                Terima kasih telah mendaftar <strong>CV WIYATA AMERTA BUSINESS RUN 2026</strong>.
                            </p>

                            @foreach ($lines as $line)
                                <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.7; color: #333;">{{ $line }}</p>
                            @endforeach

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #141414; border-radius: 12px; margin: 16px 0;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 4px 0; font-size: 12px; color: rgba(255,246,229,0.6);">KODE PENDAFTARAN</td>
                                                <td align="right" style="padding: 4px 0; font-size: 14px; font-weight: 800; color: #FFC93C; letter-spacing: 1px;">{{ $registration->code }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; font-size: 12px; color: rgba(255,246,229,0.6);">KATEGORI</td>
                                                <td align="right" style="padding: 4px 0; font-size: 14px; color: #FFF6E5;">{{ $registration->category->distance }} · {{ $registration->category->name }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0; font-size: 12px; color: rgba(255,246,229,0.6);">TOTAL BAYAR</td>
                                                <td align="right" style="padding: 4px 0; font-size: 14px; font-weight: 800; color: #FFC93C;">Rp {{ number_format($registration->total_amount, 0, ',', '.') }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.7; color: #666;">
                                Cek status pendaftaranmu dengan kode di atas di halaman
                                <a href="{{ route('registration.status') }}" style="color: #C6242D; font-weight: 700;">cek status</a>.
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background: #C6242D; border-radius: 999px;">
                                        <a href="{{ route('registration.status', ['code' => $registration->code]) }}" style="display: inline-block; padding: 12px 28px; color: #FFF6E5; font-size: 13px; font-weight: 800; text-decoration: none; letter-spacing: 0.5px;">LIHAT STATUS PENDAFTARAN</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 32px; border-top: 2px dashed rgba(20,20,20,0.15); font-size: 11px; color: #999; line-height: 1.6;">
                            Email ini dikirim otomatis oleh sistem pendaftaran CV WIYATA AMERTA BUSINESS RUN 2026.<br>
                            Jangan membalas email ini. Hubungi panitia via media sosial resmi kami.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>