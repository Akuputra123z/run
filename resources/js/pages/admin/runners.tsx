import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { show } from '@/routes/admin/registrations';
import { index } from '@/routes/admin/runners';

type RunnerRow = {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    community: string | null;
    category: string;
    race_number: string | null;
    status: string;
    status_label: string;
    created_at: string;
};

type Props = {
    runners: {
        data: RunnerRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: { id: number; distance: string; name: string }[];
    stats: { total: number; verified: number; pending: number };
    filters: { search: string | null; category: number | null };
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    verified: 'default',
    pending_verification: 'secondary',
    pending_payment: 'outline',
    cancelled: 'destructive',
};

export default function AdminRunners({ runners, categories, stats, filters }: Props) {
    const { data, setData, processing } = useForm({
        search: filters.search ?? '',
        category: filters.category ? String(filters.category) : '',
    });

    const applyFilters = () => {
        router.get(index().url, {
            search: data.search || undefined,
            category: data.category || undefined,
        }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Runner" />

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs font-semibold text-neutral-500">Total Runner</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
                            <div className="text-xs font-semibold text-neutral-500">Lunas</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <div className="text-xs font-semibold text-neutral-500">Proses</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold">Daftar Runner</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Cari kode / nama / email / HP…"
                                className="w-56"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters();
                                    }
                                }}
                            />
                            <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Kategori</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.distance} · {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters} disabled={processing} variant="outline" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                    <th className="pb-2 pr-4">Runner</th>
                                    <th className="pb-2 pr-4">Kontak</th>
                                    <th className="pb-2 pr-4">Kategori</th>
                                    <th className="pb-2 pr-4">BIB</th>
                                    <th className="pb-2 pr-4">Status</th>
                                    <th className="pb-2">Daftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runners.data.map((runner) => (
                                    <tr key={runner.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <Link href={show(runner.id).url} className="font-semibold hover:underline">
                                                {runner.name}
                                            </Link>
                                            <div className="font-mono text-xs text-neutral-500">{runner.code}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="text-xs">{runner.email}</div>
                                            <div className="font-mono text-xs text-neutral-500">
                                                {runner.phone} · {runner.city}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge variant="secondary">{runner.category}</Badge>
                                        </td>
                                        <td className="py-3 pr-4 font-mono text-xs font-bold">{runner.race_number ?? '-'}</td>
                                        <td className="py-3 pr-4">
                                            <Badge variant={STATUS_VARIANTS[runner.status] ?? 'outline'}>
                                                {runner.status_label}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-xs text-neutral-500">{runner.created_at}</td>
                                    </tr>
                                ))}
                                {runners.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                            <Users className="mx-auto mb-2 size-8 text-neutral-300" />
                                            Tidak ada runner ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {runners.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {runners.links.map((link, i) => (
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

AdminRunners.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Runner',
            href: index().url,
        },
    ],
};