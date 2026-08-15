import { Head, router, useForm } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Flag, ScanLine, Search, SearchX, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { checkIn } from '@/routes/admin';
import { checkin as checkinRoute } from '@/routes/admin/check-in';

type CheckInRegistration = {
    id: number;
    code: string;
    name: string;
    category: string;
    race_number: string | null;
    status: string;
    status_label: string;
    ops_state: 'pending' | 'picked_up' | 'checked_in';
    pickup_at: string | null;
    checked_in_at: string | null;
};

type Props = {
    registration: CheckInRegistration | null;
    query: string;
};

export default function AdminCheckIn({ registration, query }: Props) {
    const lookup = useForm({ q: query });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(checkIn().url, { q: lookup.data.q.trim() || undefined }, { preserveState: true });
    };

    const clearSearch = () => {
        lookup.setData('q', '');
        router.get(checkIn().url, {}, { preserveState: true });
    };

    const [posting, setPosting] = useState(false);

    const submitCheckin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!registration) {
            return;
        }

        setPosting(true);
        router.post(checkinRoute().url, { code: registration.code }, {
            preserveScroll: true,
            onFinish: () => setPosting(false),
        });
    };

    const canCheckin = registration !== null && registration.ops_state === 'picked_up';

    return (
        <>
            <Head title="Check-in" />

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Cari Peserta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={search} className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1">
                                <Label htmlFor="q">Kode pendaftaran / QR e-ticket</Label>
                                <Input
                                    id="q"
                                    value={lookup.data.q}
                                    onChange={(e) => lookup.setData('q', e.target.value)}
                                    placeholder="Kode, nama, atau BIB — KBR-2026-XXXX"
                                    className="mt-1.5 font-mono uppercase"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" disabled={lookup.processing} className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                                <Search className="size-4" />
                                Cari
                            </Button>
                            {query && (
                                <Button type="button" variant="outline" onClick={clearSearch} disabled={lookup.processing}>
                                    Bersihkan
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {registration ? (
                    <Card>
                        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base font-bold">{registration.name}</CardTitle>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{registration.code}</span>
                                    <span>· {registration.category}</span>
                                    <span>· BIB: <b className="font-mono">{registration.race_number ?? '-'}</b></span>
                                </div>
                            </div>
                            <Badge className={registration.checked_in_at ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                                {registration.checked_in_at ? 'Sudah Check-in' : 'Belum Check-in'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Race Pack</div>
                                    <div className="mt-1 flex items-center gap-1.5 font-semibold">
                                        {registration.pickup_at ? (
                                            <>
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                {registration.pickup_at}
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="size-4 text-amber-500" />
                                                Belum diambil
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Check-in Hari H</div>
                                    <div className="mt-1 flex items-center gap-1.5 font-semibold">
                                        {registration.checked_in_at ? (
                                            <>
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                {registration.checked_in_at}
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="size-4 text-amber-500" />
                                                Belum check-in
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <form onSubmit={submitCheckin}>
                                    <Button
                                        type="submit"
                                        disabled={posting || !canCheckin}
                                        className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]"
                                    >
                                        <BadgeCheck className="size-4" />
                                        Check-in Peserta
                                    </Button>
                                </form>
                            </div>
                            {registration.checked_in_at ? (
                                <p className="text-xs text-neutral-500">
                                    Peserta ini sudah check-in. Selamat berlari!
                                </p>
                            ) : registration.ops_state === 'pending' ? (
                                <p className="text-xs text-amber-600">
                                    Peserta belum mengambil race pack — serahkan race pack terlebih dahulu di menu <b>Race Pack</b>.
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>
                ) : query ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <SearchX className="size-10 text-amber-500" />
                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                Peserta "{query}" tidak ditemukan
                            </p>
                            <p className="max-w-md text-xs text-neutral-500">
                                Periksa kembali kode pendaftaran, nama, atau BIB yang kamu ketik. Pencarian mendukung sebagian kata (partial match).
                            </p>
                            <Button variant="outline" onClick={clearSearch}>
                                Bersihkan Pencarian
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <ScanLine className="size-10 text-neutral-300" />
                            <p className="text-sm text-neutral-500">
                                Masukkan kode pendaftaran untuk check-in peserta pada hari H.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-xs text-neutral-500 dark:border-neutral-700">
                    Syarat: peserta <b>wajib sudah mengambil race pack</b> sebelum check-in. Setelah check-in, status peserta berubah menjadi
                    <b> Sudah Check-in</b> dan siap di start line <Flag className="inline size-3" />.
                    Pencarian dapat dilakukan sebagian kata (kode, nama, atau BIB) — kode lengkap bisa dipindai dari QR e-ticket di halaman cek-status peserta.
                </div>
            </div>
        </>
    );
}

AdminCheckIn.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Check-in',
            href: checkIn().url,
        },
    ],
};
