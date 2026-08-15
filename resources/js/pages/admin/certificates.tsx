import { Head, Link, router, useForm } from '@inertiajs/react';
import { Award, Search, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { certificate, dashboard } from '@/routes';
import { index } from '@/routes/admin/certificates';

type FinisherRow = {
    id: number;
    code: string;
    name: string;
    category: string;
    race_number: string | null;
    finish_time: string;
};

type Props = {
    finishers: {
        data: FinisherRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string;
};

export default function AdminCertificates({ finishers, search }: Props) {
    const filters = useForm({ search });

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Sertifikat" />

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Award className="size-4 text-amber-500" />
                            Finisher ({finishers.data.length})
                        </CardTitle>
                        <form onSubmit={applySearch} className="flex items-center gap-2">
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
                        <table className="w-full min-w-[620px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                    <th className="pb-2 pr-4">Peserta</th>
                                    <th className="pb-2 pr-4">BIB</th>
                                    <th className="pb-2 pr-4">Kategori</th>
                                    <th className="pb-2 pr-4">Waktu Finish</th>
                                    <th className="pb-2">Sertifikat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finishers.data.map((finisher) => (
                                    <tr key={finisher.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <div className="font-semibold">{finisher.name}</div>
                                            <div className="font-mono text-xs text-neutral-500">{finisher.code}</div>
                                        </td>
                                        <td className="py-3 pr-4 font-mono text-xs font-bold">{finisher.race_number ?? '-'}</td>
                                        <td className="py-3 pr-4">
                                            <Badge variant="secondary">{finisher.category}</Badge>
                                        </td>
                                        <td className="py-3 pr-4 font-mono font-bold">{finisher.finish_time}</td>
                                        <td className="py-3">
                                            <Link
                                                href={certificate(finisher.code).url}
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                                            >
                                                <Trophy className="size-3.5" />
                                                Buka Sertifikat
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {finishers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                                            Belum ada finisher. Sertifikat tersedia setelah hasil dicatat di menu Timing.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {finishers.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {finishers.links.map((link, i) => (
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

AdminCertificates.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Sertifikat',
            href: index().url,
        },
    ],
};