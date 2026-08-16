import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Banknote, Camera, CheckCircle2, Clock, FileUp, Instagram, KeyRound, MessageCircle, Printer, Search, Trophy, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { certificate, home } from '@/routes';
import { create, proof, recover, status } from '@/routes/registration';

type RegistrationPayload = {
    id: number;
    code: string;
    name: string;
    email: string;
    category: { distance: string; name: string; price: number };
    status: 'pending_payment' | 'pending_verification' | 'verified' | 'cancelled';
    status_label: string;
    race_number: string | null;
    total_amount: number;
    payment_due_at: string | null;
    paid_at: string | null;
    pickup_at: string | null;
    checked_in_at: string | null;
    payment: {
        bank: string;
        account_number: string;
        account_name: string;
        amount: number;
        status: string;
        status_label: string;
        proof_url: string | null;
        notes: string | null;
    } | null;
    result: {
        finish_time: string;
        pace: string;
        overall_rank: number;
        category_rank: number;
    } | null;
    photos: { url: string; thumb_url: string; photographer: string | null }[];
};

type RecoveredPayload = {
    code: string;
    category: string;
    status: string;
    status_label: string;
    total_amount: number;
    payment_due_at: string | null;
};

type Props = {
    registration: RegistrationPayload | null;
    code?: string;
    recovered?: RecoveredPayload[] | null;
};

const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

function RacePhotoGallery({ photos }: { photos: RegistrationPayload['photos'] }) {
    const [visible, setVisible] = useState(8);

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {photos.slice(0, visible).map((photo, i) => (
                    <a key={i} href={photo.url} target="_blank" rel="noreferrer" download style={{ textDecoration: 'none' }}>
                        <img
                            src={photo.thumb_url}
                            alt={`Foto race ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            width={480}
                            height={480}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, display: 'block' }}
                        />
                        <div style={{ fontSize: 10.5, color: '#999', marginTop: 6, textAlign: 'center' }}>
                            📷 {photo.photographer ?? 'Download'}
                        </div>
                    </a>
                ))}
            </div>
            {visible < photos.length && (
                <button
                    type="button"
                    onClick={() => setVisible((count) => count + 8)}
                    style={{
                        marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)', color: '#FFC93C',
                        border: '1px solid rgba(255,255,255,0.15)', fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
                    }}
                >
                    Muat Lebih ({photos.length - visible} foto lagi)
                </button>
            )}
        </>
    );
}

function ETicket({ registration, qrUrl }: { registration: RegistrationPayload; qrUrl: string | null }) {
    return (
        <div className="print-ticket ticket-pad" style={{ background: '#FFF6E5', color: '#141414', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="f-mono" style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>E-TICKET · CV WIYATA AMERTA BUSINESS RUN 2026</div>
                    <div className="f-display" style={{ fontSize: 22, color: '#C6242D' }}>{registration.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 10, lineHeight: 1.7 }}>
                        {registration.category.distance} · {registration.category.name}<br />
                        BIB <span style={{ color: '#C6242D' }}>{registration.race_number}</span> · {registration.paid_at}
                    </div>
                </div>
                {qrUrl && <img className="ticket-qr" src={qrUrl} alt="QR Code e-ticket" style={{ width: 110, height: 110, borderRadius: 10, background: '#FFF6E5', flexShrink: 0 }} />}
            </div>
            <div style={{ marginTop: 18, borderTop: '2px dashed rgba(20,20,20,0.2)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <BadgeCheck size={16} color="#C6242D" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 11.5, lineHeight: 1.6, opacity: 0.75 }}>
                        <b>Tunjukkan e-ticket ini saat pengambilan race pack</b> (jersey + goodie bag). Info jadwal & lokasi pengambilan menyusul via email. Pembatalan/refund tidak berlaku setelah pendaftaran.
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11.5 }}>
                    <span style={{ background: registration.pickup_at ? '#DFF5E1' : 'rgba(20,20,20,0.06)', borderRadius: 999, padding: '6px 12px', fontWeight: 700 }}>
                        {registration.pickup_at ? `✅ Race pack diambil · ${registration.pickup_at}` : 'Race pack: belum diambil'}
                    </span>
                    <span style={{ background: registration.checked_in_at ? '#DFF5E1' : 'rgba(20,20,20,0.06)', borderRadius: 999, padding: '6px 12px', fontWeight: 700 }}>
                        {registration.checked_in_at ? `✅ Check-in hari H · ${registration.checked_in_at}` : 'Check-in: belum'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function CekStatus({ registration, code, recovered }: Props) {
    const savedRegistration = typeof window !== 'undefined'
        ? (() => {
            try {
                return JSON.parse(localStorage.getItem('kbr-registration') ?? 'null') as { code?: string; name?: string } | null;
            } catch {
                return null;
            }
        })()
        : null;

    const [lookup, setLookup] = useState(code ?? savedRegistration?.code ?? '');
    const [recoverOpen, setRecoverOpen] = useState(false);
    const recovery = useForm<{ email: string; name: string }>({ email: '', name: savedRegistration?.name ?? '' });
    const recoverError = usePage().props.errors.recover as string | undefined;
    const flashSuccess = (usePage().props as { flash?: { success?: string } }).flash?.success;
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [proofFileName, setProofFileName] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const proofInputRef = useRef<HTMLInputElement>(null);

    const [printRoot] = useState(() => {
        if (typeof document === 'undefined') {
            return null;
        }

        const el = document.createElement('div');
        el.className = 'print-root';
        document.body.appendChild(el);

        return el;
    });

    useEffect(() => () => {
        printRoot?.remove();
    }, [printRoot]);

    const shareText = registration?.result
        ? `🏁 Hasil saya di CV WIYATA AMERTA BUSINESS RUN 2026!\n⏱ ${registration.result.finish_time} · Pace ${registration.result.pace}\n#${registration.result.overall_rank} Umum · #${registration.result.category_rank} Kategori\n${registration.name} · ${registration.category.distance}\n`
        : `Saya terdaftar di CV WIYATA AMERTA BUSINESS RUN 2026!\n${registration?.name ?? ''} · ${registration?.category.distance ?? ''}\n`;

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/hasil` : '';
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`;

    const shareInstagram = async () => {
        const payload = { title: 'CV WIYATA AMERTA BUSINESS RUN 2026', text: shareText, url: shareUrl };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(payload);
            } catch {
                // user dismissed the share sheet
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(shareText + shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2500);
        } catch {
            // clipboard unavailable
        }
    };

    const { data, setData, post, processing, errors, setError } = useForm<{ proof: File | null }>({ proof: null });

    useEffect(() => {
        let cancelled = false;

        if (registration?.status === 'verified') {
            import('qrcode')
                .then(({ default: QRCode }) =>
                    QRCode.toDataURL(`${window.location.origin}/cek-status/${registration.code}`, { width: 170, margin: 1, color: { dark: '#141414', light: '#FFF6E5' } }),
                )
                .then((url) => {
                    if (!cancelled) {
                        setQrUrl(url);
                    }
                })
                .catch(() => setQrUrl(null));
        }

        return () => {
            cancelled = true;
        };
    }, [registration]);

    useEffect(() => {
        if (registration) {
            try {
                localStorage.setItem('kbr-registration', JSON.stringify({ code: registration.code, name: registration.name }));
            } catch {
                // storage unavailable
            }
        }
    }, [registration]);

    const steps = [
        { key: 'pending_payment', label: 'Pendaftaran', desc: 'Menunggu pembayaran' },
        { key: 'pending_verification', label: 'Bukti Bayar', desc: 'Menunggu verifikasi panitia' },
        { key: 'verified', label: 'Lunas', desc: 'Race number diterbitkan' },
        { key: 'pickup', label: 'Race Pack', desc: 'Jersey + goodie bag' },
        { key: 'checkin', label: 'Check-in', desc: 'Siap di start line' },
    ];
    const stepIndex = registration
        ? registration.checked_in_at
            ? 4
            : registration.pickup_at
                ? 3
                : registration.status === 'verified'
                    ? 2
                    : registration.status === 'pending_verification'
                        ? 1
                        : registration.status === 'pending_payment'
                            ? 0
                            : -1
        : -1;

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#141414', color: '#FFF6E5', minHeight: '100vh' }}>
            <Head title="Cek Status Pendaftaran" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
                * { box-sizing: border-box; }
                .f-display { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }
                .f-mono { font-family: 'JetBrains Mono', monospace; }
                .inp {
                    width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15);
                    color: #FFF6E5; border-radius: 12px; padding: 13px 16px; font-size: 14px; outline: none;
                }
                .inp:focus { border-color: #FFC93C; }
                .print-root { display: none; }
                @media (max-width: 640px) {
                    .status-label { display: none !important; }
                    .topbar-logo { font-size: 13px !important; }
                    .status-badge { position: relative !important; top: auto !important; right: auto !important; display: inline-block !important; margin-top: 14px !important; }
                    .card-pad { padding: 20px !important; }
                    .step-desc { display: none !important; }
                    .ticket-pad { padding: 18px !important; }
                    .ticket-qr { width: 84px !important; height: 84px !important; }
                    .share-actions { flex-direction: column !important; align-items: stretch !important; }
                    .share-actions > * { width: 100% !important; justify-content: center !important; padding: 13px 20px !important; font-size: 13px !important; }
                }
                @media print {
                    body > *:not(.print-root) { display: none !important; }
                    body { background: #fff; }
                    .print-root { display: block; }
                    .print-root, .print-root * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    @page { margin: 8mm; }
                }
            `}</style>

            {/* top bar */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <Link href={home()} className="f-display topbar-logo" style={{ color: '#FFF6E5', fontSize: 16, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    CV WIYATA AMERTA <span style={{ color: '#FFC93C' }}>BUSINESS RUN</span> 2026
                </Link>
                <div className="f-mono status-label" style={{ fontSize: 11, opacity: 0.6 }}>STATUS CHECK</div>
            </div>

            <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px 80px' }}>
                <div className="f-display" style={{ fontSize: 'clamp(28px, 5vw, 42px)', textAlign: 'center', marginBottom: 8 }}>
                    CEK <span style={{ color: '#FFC93C' }}>STATUS</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.65, fontWeight: 600, marginBottom: 28 }}>
                    Masukkan kode pendaftaranmu
                    <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>Kode muncul di layar setelah kamu selesai mendaftar.</div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        window.location.href = status(lookup).url;
                    }}
                    style={{ display: 'flex', gap: 10, marginBottom: 30 }}
                >
                    <input
                        className="inp f-mono"
                        value={lookup}
                        onChange={(e) => setLookup(e.target.value.toUpperCase())}
                        placeholder="KBR-2026-XXXX"
                        style={{ flex: 1, letterSpacing: 1 }}
                    />
                    <button
                        type="submit"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRadius: 12,
                            background: '#C6242D', border: 'none', color: '#FFF6E5', fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
                        }}
                    >
                        <Search size={16} /> Cari
                    </button>
                </form>

                {!registration && (
                    <div style={{ marginBottom: 30 }}>
                        <button
                            type="button"
                            onClick={() => setRecoverOpen((open) => !open)}
                            className="f-mono"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto',
                                background: 'none', border: 'none', color: '#FFC93C',
                                fontSize: 11.5, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', textDecoration: 'underline',
                            }}
                        >
                            <KeyRound size={14} /> LUPA KODE PENDAFTARAN?
                        </button>

                        {recoverOpen && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    recovery.post(recover().url);
                                }}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14,
                                    background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 16, padding: 20,
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: 14 }}>Pulihkan kode pendaftaran</div>
                                <div style={{ fontSize: 12.5, opacity: 0.65, fontWeight: 600 }}>
                                    Masukkan email dan nama lengkap yang kamu pakai saat mendaftar.
                                </div>
                                <input
                                    className="inp"
                                    type="email"
                                    placeholder="Email"
                                    value={recovery.data.email}
                                    onChange={(e) => recovery.setData('email', e.target.value)}
                                />
                                <input
                                    className="inp"
                                    placeholder="Nama lengkap"
                                    value={recovery.data.name}
                                    onChange={(e) => recovery.setData('name', e.target.value)}
                                />
                                {recoverError && (
                                    <div style={{ fontSize: 12.5, color: '#ff8a8a', fontWeight: 700 }}>{recoverError}</div>
                                )}
                                <button
                                    type="submit"
                                    disabled={recovery.processing}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        padding: '13px 24px', borderRadius: 12, background: '#FFC93C', border: 'none',
                                        color: '#141414', fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
                                        opacity: recovery.processing ? 0.6 : 1,
                                    }}
                                >
                                    <Search size={16} /> Cari Kode Saya
                                </button>
                            </form>
                        )}

                        {recovered && recovered.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                                {recovered.map((item) => (
                                    <div key={item.code} style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                            <div>
                                                <div className="f-mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: 2 }}>KODE PENDAFTARAN</div>
                                                <div className="f-mono" style={{ fontSize: 18, fontWeight: 700, color: '#FFC93C', letterSpacing: 1 }}>{item.code}</div>
                                            </div>
                                            <div
                                                style={{
                                                    padding: '6px 12px', borderRadius: 999,
                                                    background: item.status === 'verified' ? '#FFC93C' : item.status === 'cancelled' ? '#2a2a2a' : 'rgba(255,255,255,0.08)',
                                                    color: item.status === 'verified' ? '#141414' : '#FFF6E5',
                                                    fontSize: 10.5, fontWeight: 800, letterSpacing: 1, whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.status_label.toUpperCase()}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, marginBottom: 2 }}>{item.category}</div>
                                        <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, marginBottom: 12 }}>
                                            {formatRupiah(item.total_amount)}
                                            {item.payment_due_at && <> · Bayar sebelum {item.payment_due_at}</>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                window.location.href = status(item.code).url;
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '11px 20px', borderRadius: 12, background: '#C6242D', border: 'none',
                                                color: '#FFF6E5', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                            }}
                                        >
                                            Lanjut Bayar <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {registration && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* header card */}
                        <div className="card-pad" style={{ background: '#C6242D', borderRadius: 20, padding: '26px 26px', position: 'relative', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)' }}>
                            <div className="f-mono" style={{ fontSize: 11, opacity: 0.75, letterSpacing: 2 }}>REGISTRATION CODE</div>
                            <div className="f-display" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', letterSpacing: 1, margin: '6px 0 14px', overflowWrap: 'anywhere' }}>{registration.code}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{registration.name}</div>
                            <div style={{ fontSize: 12.5, opacity: 0.8, fontWeight: 600 }}>
                                {registration.category.distance} · {registration.category.name}
                                {registration.race_number && <> · <span style={{ color: '#FFC93C', fontWeight: 800 }}>BIB {registration.race_number}</span></>}
                            </div>
                            <div
                                className="status-badge"
                                style={{
                                    position: 'absolute', top: 24, right: 24, padding: '7px 16px', borderRadius: 999,
                                    background: registration.status === 'verified' ? '#FFC93C' : registration.status === 'cancelled' ? '#141414' : 'rgba(255,246,229,0.15)',
                                    color: registration.status === 'verified' ? '#141414' : '#FFF6E5',
                                    fontSize: 11, fontWeight: 800, letterSpacing: 1,
                                }}
                            >
                                {registration.status_label.toUpperCase()}
                            </div>
                        </div>

                        {flashSuccess && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: 'rgba(223,245,225,0.08)', border: '1px solid rgba(139,213,147,0.4)', borderRadius: 16, padding: 18 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                                    <CheckCircle2 size={20} color="#8BD593" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <div className="f-display" style={{ fontSize: 14 }}>Terima kasih!</div>
                                        <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, lineHeight: 1.6 }}>{flashSuccess}</div>
                                    </div>
                                </div>
                                <Link
                                    href={home()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 999,
                                        background: '#FFC93C', color: '#141414', textDecoration: 'none', fontWeight: 800, fontSize: 13,
                                    }}
                                >
                                    Terima Kasih
                                </Link>
                            </div>
                        )}

                        {registration.status === 'cancelled' ? (
                            <div style={{ background: '#1c1c1c', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.12)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <XCircle size={20} color="#ff8a8a" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Pendaftaran dibatalkan</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.7 }}>
                                        Pembayaran tidak diterima dalam batas waktu 24 jam. Silakan <Link href={create().url} style={{ color: '#FFC93C', fontWeight: 700 }}>daftar ulang</Link> dengan kategori yang sama.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* timeline */}
                                <div style={{ display: 'flex', gap: 0 }}>
                                    {steps.map((s, i) => (
                                        <div key={s.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                            {i < steps.length - 1 && (
                                                <div style={{
                                                    position: 'absolute', top: 15, left: '50%', width: '100%', height: 3,
                                                    background: i < stepIndex ? '#FFC93C' : 'rgba(255,255,255,0.15)',
                                                }} />
                                            )}
                                            <div style={{
                                                width: 32, height: 32, margin: '0 auto', borderRadius: 999, position: 'relative', zIndex: 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: i < stepIndex ? '#FFC93C' : i === stepIndex ? '#C6242D' : '#1c1c1c',
                                                color: i <= stepIndex ? '#141414' : '#FFF6E5',
                                                border: i === stepIndex ? '2px solid #FFC93C' : 'none',
                                            }}>
                                                {i < stepIndex ? <CheckCircle2 size={17} /> : i + 1}
                                            </div>
                                            <div style={{ fontSize: 10.5, fontWeight: 800, marginTop: 8, opacity: i <= stepIndex ? 1 : 0.5, padding: '0 2px' }}>{s.label}</div>
                                            <div className="step-desc" style={{ fontSize: 10, opacity: 0.5, marginTop: 2, padding: '0 2px' }}>{s.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* payment info */}
                                {registration.payment && (
                                    <div style={{ background: '#1c1c1c', borderRadius: 16, padding: 22, border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                                            <Banknote size={18} color="#FFC93C" />
                                            <span className="f-display" style={{ fontSize: 14 }}>Instruksi Pembayaran</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                                            <div>
                                                <div style={{ opacity: 0.5, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>BANK</div>
                                                <div className="f-mono" style={{ fontWeight: 700 }}>{registration.payment.bank}</div>
                                            </div>
                                            <div>
                                                <div style={{ opacity: 0.5, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>NO. REKENING</div>
                                                <div className="f-mono" style={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{registration.payment.account_number}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 13, marginTop: 12 }}>
                                            <div style={{ opacity: 0.5, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>A/N</div>
                                            <div style={{ fontWeight: 700 }}>{registration.payment.account_name}</div>
                                        </div>
                                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 13, opacity: 0.7 }}>Jumlah Transfer</span>
                                            <span className="f-display" style={{ color: '#FFC93C', fontSize: 20 }}>{formatRupiah(registration.total_amount)}</span>
                                        </div>
                                        {registration.payment_due_at && (
                                            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', fontSize: 11.5, opacity: 0.7 }}>
                                                <Clock size={13} color="#FFC93C" /> Batas transfer: {registration.payment_due_at}
                                            </div>
                                        )}
                                        {registration.payment.notes && (
                                            <div style={{ marginTop: 12, fontSize: 12.5, color: '#ffb3b3', background: 'rgba(255,138,138,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                                <b>Catatan panitia:</b> {registration.payment.notes}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* upload proof */}
                                {registration.status === 'pending_payment' && registration.payment && (
                                    <div style={{ background: '#1c1c1c', borderRadius: 16, padding: 22, border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                                            <FileUp size={18} color="#FFC93C" />
                                            <span className="f-display" style={{ fontSize: 14 }}>Upload Bukti Transfer</span>
                                        </div>
                                        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 14, lineHeight: 1.6 }}>
                                            Setelah transfer, unggah buktinya di sini (jpg/png/webp, maks 5MB). Panitia akan memverifikasi maksimal 1x24 jam.
                                        </div>
                                        <form
                                            className="flex flex-col gap-3"
                                            onSubmit={(e) => {
                                                e.preventDefault();

                                                if (!data.proof) {
                                                    setError('proof', 'Pilih file bukti transfer terlebih dahulu.');

                                                    return;
                                                }

                                                post(proof(registration.id).url, {
                                                    onSuccess: () => {
                                                        setData('proof', null);
                                                        setProofFileName(null);

                                                        if (proofInputRef.current) {
                                                            proofInputRef.current.value = '';
                                                        }
                                                    },
                                                });
                                            }}
                                        >
                                            <label
                                                style={{
                                                    display: 'flex', flexDirection: 'column', gap: 6,
                                                    background: '#141414', border: '1px dashed rgba(255,255,255,0.25)', borderRadius: 12,
                                                    padding: 14, color: '#FFF6E5', fontSize: 13, cursor: 'pointer',
                                                }}
                                            >
                                                <span style={{ fontWeight: 700 }}>
                                                    {proofFileName ?? 'Pilih file bukti transfer (jpg/png/webp, maks 5MB)'}
                                                </span>
                                                <span style={{ opacity: 0.6, fontSize: 11.5 }}>Klik untuk memilih file</span>
                                                <input
                                                    ref={proofInputRef}
                                                    type="file"
                                                    required
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] ?? null;
                                                        setData('proof', file);
                                                        setProofFileName(file ? file.name : null);
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            {errors.proof && <div style={{ color: '#ff8a8a', fontSize: 12.5 }}>{errors.proof}</div>}
                                            <button
                                                type="submit"
                                                style={{
                                                    padding: '13px 20px', borderRadius: 12, background: '#FFC93C', color: '#141414',
                                                    border: 'none', fontWeight: 800, fontSize: 13.5,
                                                    opacity: processing || !data.proof ? 0.55 : 1,
                                                    cursor: processing ? 'wait' : 'pointer',
                                                }}
                                            >
                                                {processing ? 'Mengunggah...' : 'Unggah Bukti Transfer'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* e-ticket */}
                                {registration.status === 'verified' && (
                                    <>
                                        <ETicket registration={registration} qrUrl={qrUrl} />
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="no-print"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                width: '100%', padding: '13px 20px', borderRadius: 12,
                                                background: '#C6242D', color: '#FFF6E5', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                            }}
                                        >
                                            <Printer size={15} /> Cetak E-Tiket
                                        </button>
                                    </>
                                )}

                                {printRoot && registration?.status === 'verified' && createPortal(
                                    <ETicket registration={registration} qrUrl={qrUrl} />,
                                    printRoot,
                                )}

                                {/* race result */}
                                {registration.status === 'verified' && registration.result && (
                                    <div style={{ background: '#1c1c1c', borderRadius: 20, padding: 24, border: '2px solid rgba(255,201,60,0.35)' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                                            <Trophy size={20} color="#FFC93C" />
                                            <span className="f-display" style={{ fontSize: 15 }}>Hasil Race Kamu</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
                                            <div style={{ background: '#141414', borderRadius: 12, padding: '14px 16px' }}>
                                                <div style={{ fontSize: 10.5, opacity: 0.5, fontWeight: 700, marginBottom: 4 }}>WAKTU FINISH</div>
                                                <div className="f-mono" style={{ fontSize: 17, fontWeight: 800, color: '#FFC93C' }}>{registration.result.finish_time}</div>
                                            </div>
                                            <div style={{ background: '#141414', borderRadius: 12, padding: '14px 16px' }}>
                                                <div style={{ fontSize: 10.5, opacity: 0.5, fontWeight: 700, marginBottom: 4 }}>PACE</div>
                                                <div className="f-mono" style={{ fontSize: 17, fontWeight: 800 }}>{registration.result.pace}</div>
                                            </div>
                                            <div style={{ background: '#141414', borderRadius: 12, padding: '14px 16px' }}>
                                                <div style={{ fontSize: 10.5, opacity: 0.5, fontWeight: 700, marginBottom: 4 }}>RANK UMUM</div>
                                                <div className="f-mono" style={{ fontSize: 17, fontWeight: 800, color: '#FFC93C' }}>#{registration.result.overall_rank}</div>
                                            </div>
                                            <div style={{ background: '#141414', borderRadius: 12, padding: '14px 16px' }}>
                                                <div style={{ fontSize: 10.5, opacity: 0.5, fontWeight: 700, marginBottom: 4 }}>RANK KATEGORI</div>
                                                <div className="f-mono" style={{ fontSize: 17, fontWeight: 800 }}>#{registration.result.category_rank}</div>
                                            </div>
                                        </div>
                                        <div className="share-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12,
                                                    background: '#25D366', color: '#0f3d1e', textDecoration: 'none', fontWeight: 800, fontSize: 12.5,
                                                }}
                                            >
                                                <MessageCircle size={16} /> Share WhatsApp
                                            </a>
                                            <button
                                                type="button"
                                                onClick={shareInstagram}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12,
                                                    background: '#141414', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF6E5',
                                                    fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
                                                }}
                                            >
                                                <Instagram size={16} color="#FFC93C" /> {copied ? 'Tersalin ✓' : 'Share Instagram'}
                                            </button>
                                            <Link
                                                href={certificate(registration.code).url}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 0,
                                                    padding: '11px 20px', borderRadius: 12, background: '#FFC93C', color: '#141414',
                                                    textDecoration: 'none', fontWeight: 800, fontSize: 12.5,
                                                }}
                                            >
                                                <Trophy size={15} /> Unduh Sertifikat
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* race photos */}
                                {registration.status === 'verified' && registration.photos.length > 0 && (
                                    <div style={{ background: '#1c1c1c', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                                            <Camera size={20} color="#FFC93C" />
                                            <span className="f-display" style={{ fontSize: 15 }}>Foto Race Kamu ({registration.photos.length})</span>
                                        </div>
                                        <RacePhotoGallery key={registration.code} photos={registration.photos} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 34, display: 'flex', justifyContent: 'center' }}>
                    <Link
                        href={create().url}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 999,
                            background: '#C6242D', color: '#FFF6E5', textDecoration: 'none', fontWeight: 800, fontSize: 13.5,
                        }}
                    >
                        Belum daftar? DAFTAR SEKARANG <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}