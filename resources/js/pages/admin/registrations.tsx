import { Head, Link, router, useForm } from '@inertiajs/react';
import { BadgeCheck, ChevronDown, Clock, Download, Eye, Search, Users, X } from 'lucide-react';
import { Fragment, useState } from 'react';
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
import { reject, verify } from '@/routes/admin/payments';
import { exportMethod, index, show } from '@/routes/admin/registrations';

type RegistrationRow = {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    nik: string | null;
    gender: string;
    birth_date: string;
    city: string;
    jersey_size: string;
    emergency_name: string;
    emergency_phone: string;
    community: string | null;
    status: string;
    status_label: string;
    race_number: string | null;
    total_amount: number;
    created_at: string;
    category: { distance: string; name: string };
    payment: {
        id: number;
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
    } | null;
};

type Props = {
    registrations: {
        data: RegistrationRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: { id: number; distance: string; name: string; quota: number; active_count: number }[];
    stats: {
        total: number;
        verified: number;
        pending_verification: number;
        pending_payment: number;
        revenue: number;
    };
    filters: { status: string | null; category: number | null; search: string | null };
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    verified: 'default',
    pending_verification: 'secondary',
    pending_payment: 'outline',
    cancelled: 'destructive',
};

export default function AdminRegistrations({ registrations, categories, stats, filters }: Props) {
    const { data, setData, processing } = useForm({
        status: filters.status ?? '',
        category: filters.category ? String(filters.category) : '',
        search: filters.search ?? '',
    });

    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const { data: rejectData, setData: setRejectData, post, processing: rejectProcessing, errors, setError, clearErrors } = useForm({ notes: '' });

    const applyFilters = () => {
        router.get(index().url, {
            status: data.status || undefined,
            category: data.category || undefined,
            search: data.search || undefined,
        }, { preserveState: true, replace: true });
    };

    const verifyPayment = (registration: RegistrationRow) => {
        if (!registration.payment) {
            return;
        }

        if (!window.confirm(`Verifikasi pembayaran ${registration.name} (${registration.code})? Race number akan diterbitkan otomatis.`)) {
            return;
        }

        router.post(verify(registration.payment.id).url, {}, {
            preserveScroll: true,
        });
    };

    const rejectPayment = (registration: RegistrationRow) => {
        if (!registration.payment) {
            return;
        }

        if (!rejectData.notes.trim()) {
            setError('notes', 'Alasan penolakan wajib diisi.');

            return;
        }

        post(reject(registration.payment.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingId(null);
                setRejectData('notes', '');
            },
        });
    };

    const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

    return (
        <>
            <Head title="Registrasi" />

            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
                        <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lunas</CardTitle>
                        <BadgeCheck className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.verified}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_verification}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_payment}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
                        <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatRupiah(stats.revenue)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Daftar Pendaftar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-end gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="search">Cari</Label>
                            <Input
                                id="search"
                                placeholder="Kode, nama, email, HP..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="w-64"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua</SelectItem>
                                    <SelectItem value="pending_payment">Belum Bayar</SelectItem>
                                    <SelectItem value="pending_verification">Menunggu Verifikasi</SelectItem>
                                    <SelectItem value="verified">Lunas</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Kategori</Label>
                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Semua kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.distance} · {c.name} ({c.active_count}/{c.quota})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={applyFilters} disabled={processing}>
                            <Search className="size-4" /> Terapkan
                        </Button>
                        <Button asChild variant="outline">
                            <a href={exportMethod().url}>
                                <Download className="size-4" /> Export CSV
                            </a>
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-muted-foreground">
                                    <th className="pb-2 font-medium">Kode</th>
                                    <th className="pb-2 font-medium">Peserta</th>
                                    <th className="pb-2 font-medium">Kategori</th>
                                    <th className="pb-2 font-medium">Status</th>
                                    <th className="pb-2 font-medium">Race Number</th>
                                    <th className="pb-2 text-right font-medium">Bayar</th>
                                    <th className="pb-2 text-right font-medium">Daftar</th>
                                    <th className="pb-2 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.data.map((r) => (
                                    <Fragment key={r.id}>
                                        <tr className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-3 font-mono text-xs font-semibold">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="mr-1 size-6"
                                                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                                    title={expandedId === r.id ? 'Tutup detail' : 'Lihat detail'}
                                                >
                                                    <ChevronDown className={`size-3.5 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`} />
                                                </Button>
                                                {r.code}
                                            </td>
                                            <td className="py-3">
                                                <Link href={show(r.id).url} className="font-medium hover:underline">
                                                    {r.name}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">{r.email} · {r.phone}</div>
                                            </td>
                                            <td className="py-3 font-mono text-xs">{r.category.distance} · {r.category.name}</td>
                                            <td className="py-3">
                                                <Badge variant={STATUS_VARIANTS[r.status] ?? 'outline'}>{r.status_label}</Badge>
                                            </td>
                                            <td className="py-3 font-mono text-xs">{r.race_number ?? '—'}</td>
                                            <td className="py-3 text-right font-mono text-xs">{formatRupiah(r.total_amount)}</td>
                                            <td className="py-3 text-right text-xs text-muted-foreground">{r.created_at}</td>
                                            <td className="py-3 text-right">
                                                {(r.status === 'pending_payment' || r.status === 'pending_verification') && r.payment && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => verifyPayment(r)}
                                                            disabled={rejectProcessing}
                                                            title="Verifikasi & terbitkan BIB"
                                                        >
                                                            <BadgeCheck className="size-3.5" /> Verifikasi
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}
                                                            disabled={rejectProcessing}
                                                            title="Tolak bukti"
                                                        >
                                                            <X className="size-3.5" />
                                                        </Button>
                                                        {r.payment?.proof_url && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                asChild
                                                                title="Lihat bukti transfer"
                                                            >
                                                                <a href={r.payment.proof_url} target="_blank" rel="noreferrer">
                                                                    <Eye className="size-3.5" />
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {rejectingId === r.id && (
                                            <tr className="border-b bg-destructive/5">
                                                <td colSpan={8} className="py-3 pl-8 pr-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Input
                                                            autoFocus
                                                            value={rejectData.notes}
                                                            onChange={(e) => {
                                                                setRejectData('notes', e.target.value);

                                                                if (errors.notes) {
                                                                    clearErrors('notes');
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    rejectPayment(r);
                                                                }

                                                                if (e.key === 'Escape') {
                                                                    setRejectingId(null);
                                                                }
                                                            }}
                                                            placeholder="Alasan penolakan (contoh: jumlah transfer tidak sesuai)"
                                                            className="max-w-md"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => rejectPayment(r)}
                                                            disabled={rejectProcessing}
                                                        >
                                                            Konfirmasi Tolak
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>
                                                            Batal
                                                        </Button>
                                                        {errors.notes && <span className="text-xs text-destructive">{errors.notes}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {expandedId === r.id && (
                                            <tr className="border-b bg-muted/30">
                                                <td colSpan={8} className="py-4 pl-8 pr-3">
                                                    <div className="grid gap-6 md:grid-cols-2">
                                                        <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">NIK</div>
                                                                <div className="font-mono">{r.nik ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Gender / TTL</div>
                                                                <div>{r.gender === 'men' ? 'Pria' : 'Wanita'} · {r.birth_date}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Kota</div>
                                                                <div>{r.city}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Jersey</div>
                                                                <div className="font-mono">{r.jersey_size}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Kontak Darurat</div>
                                                                <div>{r.emergency_name} · {r.emergency_phone}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Komunitas</div>
                                                                <div>{r.community ?? '—'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">Email</div>
                                                                <div>{r.email}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">No HP</div>
                                                                <div>{r.phone}</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {r.payment ? (
                                                                <div className="rounded-lg border p-3 text-sm">
                                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                                        <div className="font-semibold">Info Pembayaran</div>
                                                                        <Badge variant={r.payment.status === 'verified' ? 'default' : r.payment.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                            {r.payment.status_label}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>
                                                                            <div className="text-muted-foreground">Bank</div>
                                                                            <div className="font-mono font-semibold">{r.payment.bank}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">No. Rekening</div>
                                                                            <div className="font-mono font-semibold">{r.payment.account_number}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">Atas Nama</div>
                                                                            <div>{r.payment.account_name}</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-muted-foreground">Jumlah</div>
                                                                            <div className="font-mono font-semibold">{formatRupiah(r.payment.amount)}</div>
                                                                        </div>
                                                                    </div>
                                                                    {r.payment.notes && (
                                                                        <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                                                                            Catatan: {r.payment.notes}
                                                                        </div>
                                                                    )}
                                                                    {r.payment.verified_at && (
                                                                        <div className="mt-2 text-xs text-muted-foreground">
                                                                            Diverifikasi: {r.payment.verified_at}
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                                        Dibuat: {r.payment.created_at}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground">Belum ada pembayaran.</div>
                                                            )}
                                                            <div>
                                                                <div className="mb-1 text-xs text-muted-foreground">Bukti Transfer</div>
                                                                {r.payment?.proof_url ? (
                                                                    <a href={r.payment.proof_url} target="_blank" rel="noreferrer">
                                                                        <img
                                                                            src={r.payment.proof_url}
                                                                            alt="Bukti transfer"
                                                                            className="max-h-40 rounded border object-contain"
                                                                        />
                                                                    </a>
                                                                ) : (
                                                                    <div className="rounded border border-dashed p-3 text-center text-xs text-muted-foreground">
                                                                        Belum ada bukti transfer diunggah.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                                {registrations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                            Belum ada pendaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {registrations.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {registrations.links.map((link, i) => (
                                <Button
                                    key={i}
                                    size="sm"
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

AdminRegistrations.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Registrasi', href: index() },
    ],
};