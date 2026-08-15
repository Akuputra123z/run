import { Head, Link, router, useForm } from '@inertiajs/react';
import { BadgeCheck, PackageCheck, ScanLine, Search, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/bibs';
import { show } from '@/routes/admin/registrations';

type BibRow = {
    id: number;
    code: string;
    name: string;
    race_number: string;
    category: string;
    status: string;
    status_label: string;
    pickup_at: string | null;
    checked_in_at: string | null;
};

type Props = {
    bibs: {
        data: BibRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: { total: number; picked_up: number; checked_in: number };
    search: string;
};

export default function AdminBibs({ bibs, stats, search }: Props) {
    const filters = useForm({ search });

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Manajemen BIB" />

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs font-semibold text-neutral-500">Total BIB Terbit</div>
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
                            <div className="text-2xl font-bold text-amber-600">{stats.checked_in}</div>
                            <div className="text-xs font-semibold text-neutral-500">Check-in</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold">Daftar Nomor BIB</CardTitle>
                        <form onSubmit={applySearch} className="flex items-center gap-2">
                            <Input
                                value={filters.data.search}
                                onChange={(e) => filters.setData('search', e.target.value)}
                                placeholder="Cari BIB / kode / nama…"
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
                                    <th className="pb-2 pr-4">BIB</th>
                                    <th className="pb-2 pr-4">Peserta</th>
                                    <th className="pb-2 pr-4">Kategori</th>
                                    <th className="pb-2 pr-4">Race Pack</th>
                                    <th className="pb-2 pr-4">Check-in</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bibs.data.map((bib) => (
                                    <tr key={bib.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                                                <Ticket className="size-3.5 text-amber-500" />
                                                {bib.race_number}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Link href={show(bib.id).url} className="font-semibold hover:underline">
                                                {bib.name}
                                            </Link>
                                            <div className="font-mono text-xs text-neutral-500">{bib.code}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge variant="secondary">{bib.category}</Badge>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {bib.pickup_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                    <PackageCheck className="size-3.5" />
                                                    {bib.pickup_at}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Belum</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {bib.checked_in_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                                                    <ScanLine className="size-3.5" />
                                                    {bib.checked_in_at}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Belum</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                <BadgeCheck className="size-3.5" />
                                                {bib.status_label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {bibs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                            Belum ada BIB yang diterbitkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {bibs.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {bibs.links.map((link, i) => (
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
            </div>
        </>
    );
}

AdminBibs.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Manajemen BIB',
            href: index().url,
        },
    ],
};