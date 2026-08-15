import { Head } from '@inertiajs/react';
import { BarChart3, Download, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { exportMethod } from '@/routes/admin/registrations';
import { index } from '@/routes/admin/reports';

type Summary = {
    total: number;
    verified: number;
    pending_verification: number;
    pending_payment: number;
    cancelled: number;
    finishers: number;
    revenue: number;
};

type CategoryRow = {
    id: number;
    name: string;
    distance: string;
    price: number;
    quota: number;
    active_count: number;
    verified_count: number;
    revenue: number;
};

type Props = {
    summary: Summary;
    perCategory: CategoryRow[];
    paymentStatus: { pending: number; verified: number; rejected: number };
};

const formatRp = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function AdminReports({ summary, perCategory, paymentStatus }: Props) {
    return (
        <>
            <Head title="Laporan" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <BarChart3 className="size-5 text-[#C6242D]" />
                            Ringkasan Event
                        </div>
                        <div className="text-sm text-neutral-500">
                            Statistik pendaftaran, pembayaran, dan pendapatan
                        </div>
                    </div>
                    <Button asChild variant="outline">
                        <a href={exportMethod().url}>
                            <Download className="size-4" />
                            Export CSV Pendaftaran
                        </a>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Users className="size-5 text-neutral-400" />
                                {summary.total}
                            </div>
                            <div className="text-xs font-semibold text-neutral-500">Total Pendaftaran</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-emerald-600">{summary.verified}</div>
                            <div className="text-xs font-semibold text-neutral-500">Lunas</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-amber-600">
                                {summary.pending_verification + summary.pending_payment}
                            </div>
                            <div className="text-xs font-semibold text-neutral-500">Belum Lunas / Diproses</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{summary.cancelled}</div>
                            <div className="text-xs font-semibold text-neutral-500">Dibatalkan</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Pendapatan per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Kategori</th>
                                        <th className="pb-2 pr-4">Terisi</th>
                                        <th className="pb-2 pr-4">Lunas</th>
                                        <th className="pb-2">Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perCategory.map((row) => (
                                        <tr key={row.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4">
                                                <div className="font-semibold">{row.name}</div>
                                                <div className="text-xs text-neutral-500">{row.distance}</div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary">{row.active_count} / {row.quota}</Badge>
                                            </td>
                                            <td className="py-3 pr-4">{row.verified_count}</td>
                                            <td className="py-3 font-mono font-bold">{formatRp(row.revenue)}</td>
                                        </tr>
                                    ))}
                                    {perCategory.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                                                Belum ada kategori.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Status Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="size-4 text-amber-500" />
                                    Menunggu
                                </div>
                                <div className="text-lg font-bold">{paymentStatus.pending}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="size-4 text-emerald-500" />
                                    Diterima
                                </div>
                                <div className="text-lg font-bold">{paymentStatus.verified}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="size-4 text-red-500" />
                                    Ditolak
                                </div>
                                <div className="text-lg font-bold">{paymentStatus.rejected}</div>
                            </div>
                            <div className="mt-2 rounded-lg bg-[#C6242D] px-4 py-4 text-center text-[#FFF6E5]">
                                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Total Pendapatan</div>
                                <div className="text-2xl font-black">{formatRp(summary.revenue)}</div>
                                <div className="mt-1 text-xs opacity-80">{summary.finishers} finisher tercatat</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminReports.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan',
            href: index().url,
        },
    ],
};