import { Head, router, useForm } from '@inertiajs/react';
import { BadgeCheck, Eye, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { index, reject, verify } from '@/routes/admin/payments';

type PaymentRow = {
    id: number;
    method: string;
    bank: string;
    account_number: string;
    account_name: string;
    amount: number;
    status: string;
    status_label: string;
    proof_url: string | null;
    notes: string | null;
    verified_at: string | null;
    created_at: string;
    registration: {
        id: number;
        code: string;
        name: string;
        email: string;
        status: string;
        status_label: string;
        race_number: string | null;
        category: string;
    };
};

type Props = {
    payments: {
        data: PaymentRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: { total: number; pending: number; verified: number; rejected: number };
    filters: { status: string | null; search: string | null };
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    verified: 'default',
    pending: 'secondary',
    rejected: 'destructive',
};

export default function AdminPayments({ payments, stats, filters }: Props) {
    const { data, setData, processing } = useForm({
        status: filters.status ?? '',
        search: filters.search ?? '',
    });

    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const { data: rejectData, setData: setRejectData, post, processing: rejectProcessing, errors, setError, clearErrors } = useForm({ notes: '' });

    const applyFilters = () => {
        router.get(index().url, {
            status: data.status || undefined,
            search: data.search || undefined,
        }, { preserveState: true, replace: true });
    };

    const verifyPayment = (payment: PaymentRow) => {
        if (!window.confirm(`Verifikasi pembayaran ${payment.registration.name} (${payment.registration.code})? Race number akan diterbitkan otomatis.`)) {
            return;
        }

        router.post(verify(payment.id).url, {}, { preserveScroll: true });
    };

    const submitReject = (payment: PaymentRow) => {
        if (!rejectData.notes.trim()) {
            setError('notes', 'Alasan penolakan wajib diisi.');

            return;
        }

        post(reject(payment.id).url, { preserveScroll: true, onSuccess: () => setRejectingId(null) });
    };

    const startReject = (payment: PaymentRow) => {
        clearErrors();
        setRejectData('notes', '');
        setRejectingId(payment.id);
    };

    const formatRp = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

    return (
        <>
            <Head title="Pembayaran" />

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs font-semibold text-neutral-500">Total Pembayaran</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <div className="text-xs font-semibold text-neutral-500">Menunggu</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
                            <div className="text-xs font-semibold text-neutral-500">Diterima</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-xs font-semibold text-neutral-500">Ditolak</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-bold">Daftar Pembayaran</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Cari kode / nama / email…"
                                className="w-56"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        applyFilters();
                                    }
                                }}
                            />
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="verified">Diterima</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters} disabled={processing} variant="outline" size="icon">
                                <Search className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                    <th className="pb-2 pr-4">Peserta</th>
                                    <th className="pb-2 pr-4">Bukti</th>
                                    <th className="pb-2 pr-4">Rekening Tujuan</th>
                                    <th className="pb-2 pr-4">Jumlah</th>
                                    <th className="pb-2 pr-4">Status</th>
                                    <th className="pb-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.data.map((payment) => (
                                    <tr key={payment.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                        <td className="py-3 pr-4">
                                            <div className="font-semibold">{payment.registration.name}</div>
                                            <div className="font-mono text-xs text-neutral-500">
                                                {payment.registration.code} · {payment.registration.category}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {payment.proof_url ? (
                                                <a
                                                    href={payment.proof_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    <Eye className="size-3.5" />
                                                    Lihat bukti
                                                </a>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Belum ada</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="text-xs font-semibold">{payment.bank}</div>
                                            <div className="font-mono text-xs text-neutral-500">{payment.account_number}</div>
                                        </td>
                                        <td className="py-3 pr-4 font-mono">{formatRp(payment.amount)}</td>
                                        <td className="py-3 pr-4">
                                            <Badge variant={STATUS_VARIANTS[payment.status] ?? 'outline'}>
                                                {payment.status_label}
                                            </Badge>
                                            {payment.notes && (
                                                <div className="mt-1 max-w-[180px] text-xs text-red-600">{payment.notes}</div>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            {rejectingId === payment.id ? (
                                                <div className="flex max-w-[260px] flex-col gap-1.5">
                                                    <Label htmlFor={`notes-${payment.id}`} className="text-xs">
                                                        Alasan penolakan
                                                    </Label>
                                                    <Input
                                                        id={`notes-${payment.id}`}
                                                        value={rejectData.notes}
                                                        onChange={(e) => setRejectData('notes', e.target.value)}
                                                        placeholder="Bukti tidak terbaca, jumlah kurang…"
                                                    />
                                                    {errors.notes && <div className="text-xs text-red-600">{errors.notes}</div>}
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={rejectProcessing}
                                                            onClick={() => submitReject(payment)}
                                                        >
                                                            Konfirmasi
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>
                                                            Batal
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]"
                                                                onClick={() => verifyPayment(payment)}
                                                            >
                                                                <BadgeCheck className="size-4" />
                                                                Verifikasi
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => startReject(payment)}>
                                                                <X className="size-4" />
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                            Tidak ada pembayaran ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {payments.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {payments.links.map((link, i) => (
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

AdminPayments.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Pembayaran',
            href: index().url,
        },
    ],
};