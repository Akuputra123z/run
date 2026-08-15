import { Head, router, useForm } from '@inertiajs/react';
import { Download, FileUp, Search, Timer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index, importMethod, update } from '@/routes/admin/timing';

type ResultRow = {
    id: number;
    code: string;
    name: string;
    category: string;
    race_number: string | null;
    finish_time: string | null;
};

type Props = {
    registrations: {
        data: ResultRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string;
    imported: number;
    skipped: number;
};

export default function AdminTiming({ registrations, search, imported, skipped }: Props) {
    const filters = useForm({ search });

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    const importCsv = useForm<{ csv: File | null }>({ csv: null });

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        importCsv.post(importMethod().url, { preserveScroll: true });
    };

    const setTime = (row: ResultRow, value: string) => {
        router.post(update().url, {
            registration_id: row.id,
            finish_time: value || null,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Timing" />

            <div className="flex flex-col gap-6">
                {imported > 0 && (
                    <div className="rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        Import selesai: {imported} peserta diperbarui, {skipped} baris dilewati.
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Timer className="size-4" />
                                Input Waktu Finish
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
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Peserta</th>
                                        <th className="pb-2 pr-4">BIB</th>
                                        <th className="pb-2 pr-4">Kategori</th>
                                        <th className="pb-2">Waktu (H:MM:SS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.data.map((row) => (
                                        <tr key={row.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4">
                                                <div className="font-semibold">{row.name}</div>
                                                <div className="font-mono text-xs text-neutral-500">{row.code}</div>
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-xs font-bold">{row.race_number ?? '-'}</td>
                                            <td className="py-3 pr-4">{row.category}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        key={row.id + (row.finish_time ?? '')}
                                                        defaultValue={row.finish_time ?? ''}
                                                        placeholder="1:12:35"
                                                        className="w-32 font-mono"
                                                        onBlur={(e) => {
                                                            if (e.target.value.trim() !== (row.finish_time ?? '')) {
                                                                setTime(row, e.target.value.trim());
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                (e.target as HTMLInputElement).blur();
                                                            }
                                                        }}
                                                    />
                                                    {row.finish_time && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Hapus waktu"
                                                            onClick={() => setTime(row, '')}
                                                        >
                                                            <Trash2 className="size-4 text-neutral-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                                                Tidak ada peserta ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <FileUp className="size-4" />
                                Import CSV
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="text-xs leading-relaxed text-neutral-500">
                                Format: kolom pertama <b>kode</b>, kolom kedua <b>waktu</b> (H:MM:SS). Baris header
                                (code,time) otomatis dilewati.
                            </p>
                            <form onSubmit={submitImport} className="flex flex-col gap-3">
                                <div>
                                    <Label htmlFor="csv">File CSV</Label>
                                    <Input
                                        id="csv"
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="mt-1.5"
                                        onChange={(e) => importCsv.setData('csv', e.target.files?.[0] ?? null)}
                                    />
                                </div>
                                {importCsv.errors.csv && (
                                    <div className="text-xs text-red-600">{importCsv.errors.csv}</div>
                                )}
                                <Button type="submit" disabled={importCsv.processing || !importCsv.data.csv} className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                                    <Download className="size-4" />
                                    Import
                                </Button>
                            </form>
                            <div className="rounded-lg bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-500 dark:bg-neutral-900">
                                Contoh file:
                                <pre className="mt-1 font-mono text-[11px]">code,time
KBR-2026-A1B2,1:12:35
KBR-2026-C3D4,58:20</pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminTiming.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Timing',
            href: index().url,
        },
    ],
};