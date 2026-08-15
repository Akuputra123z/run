import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, PackageCheck, PackageX, ScanLine, Search, SearchX, Ticket, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { racePack } from '@/routes/admin';
import { pickup } from '@/routes/admin/race-pack';
import { show } from '@/routes/admin/registrations';

type RacePackRegistration = {
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
    registration: RacePackRegistration | null;
    query: string;
    registrations: {
        data: RacePackRegistration[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: { total: number; picked_up: number };
    search: string;
};

export default function AdminRacePack({ registration, query, registrations, stats, search: tableSearch }: Props) {
    const lookup = useForm({ q: query });
    const filters = useForm({ search: tableSearch });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(racePack().url, { q: lookup.data.q.trim() || undefined }, { preserveState: true });
    };

    const clearSearch = () => {
        lookup.setData('q', '');
        router.get(racePack().url, {}, { preserveState: true });
    };

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(racePack().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    const [posting, setPosting] = useState(false);

    const submitPickup = (e: React.FormEvent) => {
        e.preventDefault();

        if (!registration) {
            return;
        }

        setPosting(true);
        router.post(pickup().url, { code: registration.code }, {
            preserveScroll: true,
            onFinish: () => setPosting(false),
        });
    };

    const canPickup = registration !== null && registration.ops_state === 'pending' && registration.status === 'verified';

    return (
        <>
            <Head title="Race Pack" />

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
                            <Badge className={registration.ops_state === 'picked_up' || registration.ops_state === 'checked_in' ? 'bg-emerald-100 text-emerald-800' : registration.status === 'verified' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}>
                                {registration.pickup_at ? 'Race Pack Diambil' : registration.status === 'verified' ? 'Lunas · Siap Diambil' : registration.status_label}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-900">
                                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Race Pack Pickup</div>
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

                            <div className="flex flex-wrap gap-3">
                                <form onSubmit={submitPickup}>
                                    <Button
                                        type="submit"
                                        disabled={posting || !canPickup}
                                        className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]"
                                    >
                                        <PackageCheck className="size-4" />
                                        Serahkan Race Pack
                                    </Button>
                                </form>
                            </div>
                            {registration.ops_state !== 'pending' && (
                                <p className="text-xs text-neutral-500">
                                    {registration.ops_state === 'checked_in'
                                        ? 'Peserta ini sudah check-in pada hari H — race pack tidak dapat diserahkan lagi.'
                                        : 'Race pack untuk peserta ini sudah diserahkan.'}
                                </p>
                            )}
                            {registration.status !== 'verified' && registration.ops_state === 'pending' && (
                                <p className="text-xs text-amber-600">
                                    Peserta belum lunas — race pack hanya dapat diserahkan setelah pembayaran diverifikasi.
                                </p>
                            )}
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
                                Masukkan kode pendaftaran untuk menyerahkan race pack.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs font-semibold text-neutral-500">Total Peserta</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-emerald-600">{stats.picked_up}</div>
                            <div className="text-xs font-semibold text-neutral-500">Race Pack Diambil</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-amber-600">{stats.total - stats.picked_up}</div>
                            <div className="text-xs font-semibold text-neutral-500">Belum Diambil</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold">Daftar Peserta</CardTitle>
                        <form onSubmit={applyFilter} className="flex items-center gap-2">
                            <Input
                                value={filters.data.search}
                                onChange={(e) => filters.setData('search', e.target.value)}
                                placeholder="Cari kode / nama / BIB…"
                                className="w-56"
                            />
                            <Button type="submit" variant="outline" size="icon" disabled={filters.processing}>
                                <Search className="size-4" />
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                    <th className="pb-2 pr-4">Kode</th>
                                    <th className="pb-2 pr-4">Peserta</th>
                                    <th className="pb-2 pr-4">Kategori</th>
                                    <th className="pb-2 pr-4">BIB</th>
                                    <th className="pb-2 pr-4">Status</th>
                                    <th className="pb-2">Race Pack</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.data.map((row) => (
                                    <tr key={row.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                        <td className="py-3 pr-4 font-mono text-xs font-bold">{row.code}</td>
                                        <td className="py-3 pr-4">
                                            <Link href={show(row.id).url} className="font-semibold hover:underline">
                                                {row.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge variant="secondary">{row.category}</Badge>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                                                <Ticket className="size-3.5 text-amber-500" />
                                                {row.race_number ?? '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.status === 'verified' ? 'text-emerald-600' : 'text-neutral-500'}`}>
                                                {row.status_label}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {row.pickup_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                    <PackageCheck className="size-3.5" />
                                                    {row.pickup_at}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                                                    <PackageX className="size-3.5" />
                                                    Belum
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {registrations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                            Belum ada peserta yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {registrations.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {registrations.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url!)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-xs text-neutral-500 dark:border-neutral-700">
                    Syarat: peserta <b>sudah lunas</b> (status verified). Setelah race pack diserahkan, peserta dapat lanjut ke menu <b>Check-in</b> pada hari H.
                    Pencarian dapat dilakukan sebagian kata (kode, nama, atau BIB) — kode lengkap bisa dipindai dari QR e-ticket di halaman cek-status peserta.
                </div>
            </div>
        </>
    );
}

AdminRacePack.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Race Pack',
            href: racePack().url,
        },
    ],
};
