import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { reject, verify } from '@/routes/admin/payments';
import { index } from '@/routes/admin/registrations';

type PaymentRow = {
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
};

type RegistrationDetail = {
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
    payments: PaymentRow[];
};

type Props = {
    registration: RegistrationDetail;
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    verified: 'default',
    pending_verification: 'secondary',
    pending_payment: 'outline',
    cancelled: 'destructive',
};

export default function AdminRegistrationDetail({ registration }: Props) {
    const [rejecting, setRejecting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ notes: '' });

    const payment = registration.payments[registration.payments.length - 1];

    const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

    const verifyPayment = () => {
        if (!payment) {
            return;
        }

        if (!window.confirm('Verifikasi pembayaran ini? Race number akan diterbitkan otomatis.')) {
            return;
        }

        setVerifying(true);
        router.post(verify(payment.id).url, {}, {
            onFinish: () => setVerifying(false),
            preserveScroll: true,
        });
    };

    const rejectPayment = () => {
        if (!payment) {
            return;
        }

        post(reject(payment.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setRejecting(false);
                setData('notes', '');
            },
        });
    };

    return (
        <>
            <Head title={`Pendaftar ${registration.code}`} />

            <div className="mb-4 flex items-center justify-between">
                <Link href={index().url} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-4" /> Kembali ke daftar
                </Link>
                <Badge variant={STATUS_VARIANTS[registration.status] ?? 'outline'} className="text-sm">
                    {registration.status_label}
                </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Peserta</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                            <div>
                                <div className="text-xs text-muted-foreground">Kode</div>
                                <div className="font-mono font-semibold">{registration.code}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Race Number</div>
                                <div className="font-mono font-semibold">{registration.race_number ?? '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Nama</div>
                                <div className="font-semibold">{registration.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Email / HP</div>
                                <div>{registration.email} · {registration.phone}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">NIK</div>
                                <div>{registration.nik ?? '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Gender / TTL</div>
                                <div>{registration.gender === 'men' ? 'Pria' : 'Wanita'} · {registration.birth_date}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Kota / Komunitas</div>
                                <div>{registration.city}{registration.community ? ` · ${registration.community}` : ''}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Jersey</div>
                                <div className="font-mono">{registration.jersey_size}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Kontak Darurat</div>
                                <div>{registration.emergency_name} · {registration.emergency_phone}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Kategori</div>
                                <div className="font-mono">{registration.category.distance} · {registration.category.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Total Bayar</div>
                                <div className="font-mono font-semibold">{formatRupiah(registration.total_amount)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Daftar Pada</div>
                                <div>{registration.created_at}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {registration.payments.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Belum ada pembayaran.</div>
                            ) : (
                                <div className="space-y-3">
                                    {[...registration.payments].reverse().map((p) => (
                                        <div key={p.id} className="rounded-lg border p-4 text-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="font-mono font-semibold">
                                                    {p.bank} {p.account_number} · {formatRupiah(p.amount)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={p.status === 'verified' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                        {p.status_label}
                                                    </Badge>
                                                    {p.verified_at && (
                                                        <span className="text-xs text-muted-foreground">{p.verified_at}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">{p.created_at}</div>
                                            {p.notes && (
                                                <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                                                    Catatan: {p.notes}
                                                </div>
                                            )}
                                            {p.proof_url && (
                                                <a href={p.proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                                                    <img
                                                        src={p.proof_url}
                                                        alt="Bukti transfer"
                                                        className="max-h-48 rounded border object-contain"
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {registration.status === 'pending_verification' && payment && payment.proof_url && (
                        <Card className="border-primary/40">
                            <CardHeader>
                                <CardTitle>Aksi Verifikasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full"
                                    onClick={verifyPayment}
                                    disabled={verifying}
                                >
                                    <Check className="size-4" /> {verifying ? 'Memproses...' : 'Verifikasi & Terbitkan BIB'}
                                </Button>
                                {!rejecting ? (
                                    <Button className="w-full" variant="destructive" onClick={() => setRejecting(true)}>
                                        <X className="size-4" /> Tolak Bukti
                                    </Button>
                                ) : (
                                    <div className="space-y-2 rounded-lg border border-destructive/30 p-3">
                                        <Label htmlFor="notes">Alasan penolakan</Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Contoh: jumlah transfer tidak sesuai"
                                        />
                                        {errors.notes && <div className="text-xs text-destructive">{errors.notes}</div>}
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1"
                                                variant="destructive"
                                                size="sm"
                                                onClick={rejectPayment}
                                                disabled={processing}
                                            >
                                                Konfirmasi Tolak
                                            </Button>
                                            <Button className="flex-1" size="sm" variant="outline" onClick={() => setRejecting(false)}>
                                                Batal
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {payment && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Info Rekening Peserta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">Bank</div>
                                    <div className="font-mono font-semibold">{payment.bank}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">No. Rekening</div>
                                    <div className="font-mono font-semibold">{payment.account_number}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Atas Nama</div>
                                    <div>{payment.account_name}</div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

AdminRegistrationDetail.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Registrasi', href: index() },
    ],
};