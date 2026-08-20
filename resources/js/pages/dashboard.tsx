import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Backpack,
    BadgeCheck,
    Banknote,
    BarChart3,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    Flag,
    Grid3x3,
    MapPin,
    Medal,
    MoreVertical,
    RotateCcw,
    Search,
    ShoppingBag,
    Ticket,
    Trophy,
    Wallet,
    XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { certificate, dashboard, home } from '@/routes';
import { index as paymentsIndex } from '@/routes/admin/payments';
import { index as registrationsIndex } from '@/routes/admin/registrations';
import { status } from '@/routes/registration';
import { publicMethod } from '@/routes/results';

type Stats = {
    total: number;
    verified: number;
    pending_verification: number;
    pending_payment: number;
    revenue: number;
};

type Recent = {
    code: string;
    name: string;
    category: string;
    status: string;
    status_label: string;
    race_number: string | null;
    created_at: string;
};

type RunnerRegistration = {
    code: string;
    name: string;
    category: string;
    category_name: string;
    status: string;
    status_label: string;
    race_number: string | null;
    total_amount: number;
    payment_status: string | null;
    payment_status_label: string | null;
    pickup_at: string | null;
    checked_in_at: string | null;
    paid_at: string | null;
    result: {
        finish_time: string;
        pace: string;
        overall_rank: number;
        category_rank: number;
    } | null;
    photo_count: number;
};

type EventInfo = {
    event_name: string | null;
    event_date: string | null;
    event_location: string | null;
};

type Analytics = {
    overview: {
        revenue: number;
        revenue_pct: number;
        verified: number;
        pending_verification: number;
        total: number;
        week_count: number;
        week_pct: number;
        month_revenue: number;
        month_pending: number;
    };
    revenue_weekly: { label: string; earn: number; expense: number }[];
    monthly: { label: string; value: number }[];
    category_share: { name: string; value: number; color: string }[];
    weekly_trend: { day: string; verified: number; pending: number }[];
    weekly_area: { label: string; value: number }[];
    top_stats: { title: string; desc: string; value: number; suffix: string }[];
    transactions: {
        name: string;
        code: string;
        desc: string;
        amount: number;
        positive: boolean;
        status: string;
    }[];
};

type Props = {
    is_admin: boolean;
    stats: Stats | null;
    recent: Recent[];
    analytics: Analytics | null;
    registration: RunnerRegistration | null;
    event: EventInfo;
};

const BRAND = {
    red: '#C6242D',
    redDark: '#8B1620',
    black: '#141414',
    yellow: '#FFC93C',
    cream: '#FFF6E5',
};

const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

const formatShortRupiah = (value: number) => {
    const abs = Math.abs(value);

    if (abs >= 1_000_000) {
        return (
            (value / 1_000_000).toLocaleString('id-ID', {
                maximumFractionDigits: 1,
            }) + 'jt'
        );
    }

    if (abs >= 1_000) {
        return (
            (value / 1_000).toLocaleString('id-ID', {
                maximumFractionDigits: 0,
            }) + 'rb'
        );
    }

    return String(value);
};

const STATUS_ICON: Record<string, typeof Wallet> = {
    pending_payment: Banknote,
    pending_verification: Clock,
    verified: Wallet,
    cancelled: RotateCcw,
};

const EVENT_LINE = (event: EventInfo) =>
    [event.event_name, event.event_date, event.event_location]
        .filter(Boolean)
        .join(' · ');

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: 'easeOut' as const,
        },
    }),
};

function AnalyticsCard({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
        >
            {children}
        </div>
    );
}

function AnalyticsBadge({
    positive = true,
    children,
}: {
    positive?: boolean;
    children: React.ReactNode;
}) {
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                positive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                    : 'bg-rose-50 text-rose-500 dark:bg-rose-950'
            }`}
        >
            {children}
        </span>
    );
}

function IconButton({ children }: { children: React.ReactNode }) {
    return (
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {children}
        </button>
    );
}

function RevenuePillChart({
    data,
    height = 224,
}: {
    data: Analytics['revenue_weekly'];
    height?: number;
}) {
    const w = 100 / data.length;
    const maxTotal = Math.max(1, ...data.map((d) => d.earn + d.expense));
    const pillW = Math.min(w * 0.22, 4.5);
    const gap = Math.min(w * 0.08, 1.5);

    return (
        <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
        >
            {data.map((d) => {
                const cx = w * (data.indexOf(d) + 0.5);
                const earnH = (d.earn / maxTotal) * (height - 10);
                const expH = (d.expense / maxTotal) * (height - 10);

                return (
                    <g key={d.label}>
                        <rect
                            x={cx - gap / 2 - pillW}
                            y={height - earnH}
                            width={pillW}
                            height={earnH}
                            rx={pillW / 2}
                            fill="#d4d4d8"
                        />
                        <rect
                            x={cx + gap / 2}
                            y={height - expH}
                            width={pillW}
                            height={expH}
                            rx={pillW / 2}
                            fill="#18181b"
                        />
                    </g>
                );
            })}
        </svg>
    );
}

function DualPillChart({
    data,
    height = 200,
}: {
    data: Analytics['weekly_trend'];
    height?: number;
}) {
    const w = 100 / data.length;
    const max = Math.max(1, ...data.flatMap((d) => [d.verified, d.pending]));
    const isEmpty = data.every((d) => d.verified === 0 && d.pending === 0);

    return (
        <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
        >
            {isEmpty ? (
                <text
                    x="50"
                    y={height / 2}
                    textAnchor="middle"
                    className="fill-zinc-300 dark:fill-zinc-600"
                    style={{ fontSize: 4 }}
                >
                    Belum ada aktivitas
                </text>
            ) : (
                data.map((d) => {
                    const cx = w * (data.indexOf(d) + 0.5);
                    const backH = (d.pending / max) * (height - 10);
                    const frontH = (d.verified / max) * (height - 10);
                    const pillWBack = Math.min(w * 0.34, 7);
                    const pillWFront = Math.min(w * 0.2, 4.2);

                    return (
                        <g key={d.day}>
                            <rect
                                x={cx - pillWBack / 2}
                                y={height - backH}
                                width={pillWBack}
                                height={backH}
                                rx={pillWBack / 2}
                                fill="#e4e4e7"
                            />
                            <rect
                                x={cx - pillWFront / 2}
                                y={height - frontH}
                                width={pillWFront}
                                height={frontH}
                                rx={pillWFront / 2}
                                fill="#18181b"
                            />
                        </g>
                    );
                })
            )}
        </svg>
    );
}

function AreaLineChart({
    data,
    height = 80,
}: {
    data: { label: string; value: number }[];
    height?: number;
}) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const isEmpty = data.every((d) => d.value === 0);
    const points = data
        .map(
            (d, i) =>
                `${(i / (data.length - 1 || 1)) * 100},${height - (d.value / max) * (height - 6) - 3}`,
        )
        .join(' ');

    return (
        <svg
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
        >
            {isEmpty ? (
                <text
                    x="50"
                    y={height / 2}
                    textAnchor="middle"
                    className="fill-zinc-300 dark:fill-zinc-600"
                    style={{ fontSize: 4 }}
                >
                    Belum ada aktivitas
                </text>
            ) : (
                <>
                    <defs>
                        <linearGradient
                            id="areaFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#18181b"
                                stopOpacity={0.25}
                            />
                            <stop
                                offset="100%"
                                stopColor="#18181b"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <polygon
                        points={`0,${height} ${points} 100,${height}`}
                        fill="url(#areaFill)"
                    />
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#18181b"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </>
            )}
        </svg>
    );
}

function DonutChart({ data }: { data: Analytics['category_share'] }) {
    const total = Math.max(
        1,
        data.reduce((sum, d) => sum + d.value, 0),
    );

    const segments = data.reduce<
        {
            name: string;
            value: number;
            color: string;
            start: number;
            angle: number;
        }[]
    >((result, d) => {
        const previous = result[result.length - 1];
        const start = previous ? previous.start + previous.angle : 0;
        const angle = (d.value / total) * 360;

        result.push({ ...d, start, angle });

        return result;
    }, []);

    return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
            {segments.map((d) => {
                const largeArc = d.angle > 180 ? 1 : 0;
                const startRad = ((d.start - 90) * Math.PI) / 180;
                const endRad = ((d.start + d.angle - 90) * Math.PI) / 180;
                const x1 = 50 + 42 * Math.cos(startRad);
                const y1 = 50 + 42 * Math.sin(startRad);
                const x2 = 50 + 42 * Math.cos(endRad);
                const y2 = 50 + 42 * Math.sin(endRad);

                return (
                    <path
                        key={d.name}
                        d={`M ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2}`}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={14}
                    />
                );
            })}
        </svg>
    );
}

function BrandHero({
    eyebrow,
    title,
    subtitle,
    action,
}: {
    eyebrow: string;
    title: string;
    subtitle: string | null;
    action?: React.ReactNode;
}) {
    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(160deg, ${BRAND.redDark} 0%, ${BRAND.red} 55%, #a31e27 100%)`,
                borderRadius: 20,
                padding: '24px 26px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
            }}
        >
            <div
                className="grain"
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.12,
                    backgroundImage:
                        'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
                    backgroundSize: '5px 5px',
                }}
            />
            <div style={{ position: 'relative' }}>
                <div
                    className="f-mono"
                    style={{
                        color: BRAND.yellow,
                        fontSize: 10,
                        letterSpacing: 2,
                        fontWeight: 700,
                    }}
                >
                    {eyebrow}
                </div>
                <div
                    className="f-display"
                    style={{
                        color: BRAND.cream,
                        fontSize: 'clamp(22px, 4vw, 34px)',
                        marginTop: 4,
                        textShadow: '0 2px 0 rgba(0,0,0,0.25)',
                    }}
                >
                    {title}
                </div>
                {subtitle && (
                    <div
                        style={{
                            color: 'rgba(255,246,229,0.85)',
                            fontSize: 12.5,
                            marginTop: 6,
                        }}
                    >
                        {subtitle}
                    </div>
                )}
            </div>
            {action && <div style={{ position: 'relative' }}>{action}</div>}
        </div>
    );
}

function RunnerDashboard({
    registration,
    event,
}: {
    registration: RunnerRegistration;
    event: EventInfo;
}) {
    const steps = [
        { key: 'pending_payment', label: 'Pendaftaran' },
        { key: 'pending_verification', label: 'Bukti Bayar' },
        { key: 'verified', label: 'Lunas' },
        { key: 'pickup', label: 'Race Pack' },
        { key: 'checkin', label: 'Check-in' },
    ];

    const stepIndex = registration.checked_in_at
        ? 4
        : registration.pickup_at
          ? 3
          : registration.status === 'verified'
            ? 2
            : registration.status === 'pending_verification'
              ? 1
              : registration.status === 'pending_payment'
                ? 0
                : -1;

    const summary = [
        {
            label: 'Kategori',
            value: `${registration.category} · ${registration.category_name}`,
            icon: null,
        },
        {
            label: 'Total Bayar',
            value: formatRupiah(registration.total_amount),
            icon: null,
        },
        {
            label: 'Pembayaran',
            value:
                registration.payment_status === 'verified'
                    ? registration.payment_status_label
                    : registration.payment_status === 'rejected'
                      ? 'Ditolak'
                      : registration.payment_status_label,
            icon:
                registration.payment_status === 'verified' ? (
                    <BadgeCheck
                        style={{ color: '#FFC93C' }}
                        className="size-4"
                    />
                ) : registration.payment_status === 'rejected' ? (
                    <XCircle style={{ color: '#ff6b6b' }} className="size-4" />
                ) : (
                    <Clock style={{ color: '#FFC93C' }} className="size-4" />
                ),
        },
        {
            label: 'Race Pack',
            value:
                registration.pickup_at || registration.checked_in_at
                    ? 'Diambil'
                    : 'Belum diambil',
            icon:
                registration.pickup_at || registration.checked_in_at ? (
                    <CheckCircle2
                        style={{ color: '#FFC93C' }}
                        className="size-4"
                    />
                ) : (
                    <XCircle style={{ color: '#ff6b6b' }} className="size-4" />
                ),
        },
    ];

    return (
        <div
            style={{
                background: BRAND.cream,
                color: BRAND.black,
                borderRadius: 24,
                overflow: 'hidden',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            <BrandHero
                eyebrow="RUNNER DASHBOARD"
                title={`HALO, ${registration.name.split(' ')[0].toUpperCase()}!`}
                subtitle={EVENT_LINE(event)}
                action={
                    <div style={{ textAlign: 'right' }}>
                        <span
                            style={{
                                display: 'inline-block',
                                background: 'rgba(255,201,60,0.18)',
                                border: `1px solid ${BRAND.yellow}`,
                                color: BRAND.yellow,
                                padding: '8px 18px',
                                borderRadius: 999,
                                fontWeight: 800,
                                fontSize: 12.5,
                            }}
                        >
                            {registration.status_label}
                        </span>
                        <div
                            className="f-mono"
                            style={{
                                color: BRAND.cream,
                                fontSize: 11,
                                marginTop: 10,
                                opacity: 0.8,
                            }}
                        >
                            {registration.code}
                        </div>
                    </div>
                }
            />

            <div
                style={{
                    padding: '26px 26px 38px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                }}
            >
                <div
                    style={{
                        background: BRAND.black,
                        borderRadius: 20,
                        padding: '24px 26px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 16,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div>
                        <div
                            className="f-mono"
                            style={{
                                color: BRAND.cream,
                                opacity: 0.55,
                                fontSize: 10,
                                letterSpacing: 2,
                                fontWeight: 700,
                            }}
                        >
                            BIB NUMBER
                        </div>
                        {registration.race_number ? (
                            <div
                                className="f-display"
                                style={{
                                    color: BRAND.yellow,
                                    fontSize: 32,
                                    marginTop: 4,
                                    textShadow: '0 2px 0 rgba(0,0,0,0.6)',
                                }}
                            >
                                {registration.race_number}
                            </div>
                        ) : (
                            <div
                                className="f-display"
                                style={{
                                    color: BRAND.cream,
                                    fontSize: 20,
                                    marginTop: 6,
                                    opacity: 0.6,
                                }}
                            >
                                BELUM TERBIT
                            </div>
                        )}
                        <div
                            style={{
                                color: BRAND.cream,
                                fontSize: 12.5,
                                marginTop: 8,
                                opacity: 0.85,
                            }}
                        >
                            {registration.category} ·{' '}
                            {registration.category_name} ·{' '}
                            {formatRupiah(registration.total_amount)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        <Link
                            href={status(registration.code).url}
                            className="shimmer-btn"
                            style={{
                                background: BRAND.red,
                                color: BRAND.cream,
                                padding: '12px 22px',
                                borderRadius: 999,
                                fontWeight: 800,
                                fontSize: 12.5,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Ticket className="size-4" /> E-Ticket
                        </Link>
                        <Link
                            href={publicMethod().url}
                            style={{
                                background: BRAND.cream,
                                color: BRAND.black,
                                border: `2px solid ${BRAND.black}`,
                                padding: '12px 22px',
                                borderRadius: 999,
                                fontWeight: 800,
                                fontSize: 12.5,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Medal className="size-4" /> Hasil
                        </Link>
                        {registration.result && (
                            <Link
                                href={certificate(registration.code).url}
                                style={{
                                    background: BRAND.yellow,
                                    color: BRAND.black,
                                    padding: '12px 22px',
                                    borderRadius: 999,
                                    fontWeight: 800,
                                    fontSize: 12.5,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <Trophy className="size-4" /> Sertifikat
                            </Link>
                        )}
                        <Link
                            href={`${home().url}#rute`}
                            style={{
                                border: '2px solid rgba(255,255,255,0.35)',
                                color: BRAND.cream,
                                padding: '12px 22px',
                                borderRadius: 999,
                                fontWeight: 800,
                                fontSize: 12.5,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <MapPin className="size-4" /> Rute
                        </Link>
                    </div>
                </div>

                <div
                    className="f-display"
                    style={{ fontSize: 16, color: BRAND.redDark }}
                >
                    PERJALANAN REGISTRASI
                </div>

                <div
                    style={{
                        background: '#fff',
                        border: `2px solid ${BRAND.black}`,
                        borderRadius: 20,
                        padding: '24px 26px',
                    }}
                >
                    <div className="flex gap-0">
                        {steps.map((s, i) => (
                            <div
                                key={s.key}
                                className="relative flex-1 text-center"
                            >
                                {i < steps.length - 1 && (
                                    <div
                                        className="absolute top-4 left-1/2 h-0.5 w-full"
                                        style={{
                                            background:
                                                i < stepIndex
                                                    ? BRAND.red
                                                    : 'rgb(229 229 229)',
                                        }}
                                    />
                                )}
                                <div
                                    className="relative z-10 mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold"
                                    style={{
                                        background:
                                            i < stepIndex
                                                ? BRAND.red
                                                : i === stepIndex
                                                  ? BRAND.black
                                                  : 'rgb(229 229 229)',
                                        border:
                                            i === stepIndex
                                                ? `2px solid ${BRAND.yellow}`
                                                : 'none',
                                        color:
                                            i <= stepIndex
                                                ? BRAND.cream
                                                : '#737373',
                                    }}
                                >
                                    {i < stepIndex ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <div
                                    className={`mt-2 text-[10px] font-bold tracking-wide uppercase ${i <= stepIndex ? 'text-neutral-900' : 'text-neutral-400'}`}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(170px, 1fr))',
                            gap: 12,
                            marginTop: 22,
                        }}
                    >
                        {summary.map((item) => (
                            <div
                                key={item.label}
                                style={{
                                    background: BRAND.black,
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                }}
                            >
                                <div
                                    className="f-mono"
                                    style={{
                                        color: BRAND.yellow,
                                        fontSize: 9.5,
                                        letterSpacing: 1.5,
                                        fontWeight: 700,
                                        opacity: 0.85,
                                    }}
                                >
                                    {item.label.toUpperCase()}
                                </div>
                                <div
                                    className="mt-1.5 flex items-center gap-1.5 text-sm font-bold"
                                    style={{ color: BRAND.cream }}
                                >
                                    {item.icon} {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {registration.result && (
                        <div
                            style={{
                                marginTop: 18,
                                background: `linear-gradient(160deg, ${BRAND.redDark} 0%, ${BRAND.red} 100%)`,
                                borderRadius: 14,
                                padding: '16px 20px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <div
                                    className="f-display"
                                    style={{
                                        color: BRAND.yellow,
                                        fontSize: 22,
                                    }}
                                >
                                    FINISH! 🏁
                                </div>
                                <div
                                    style={{
                                        color: BRAND.cream,
                                        fontSize: 13,
                                        marginTop: 4,
                                        opacity: 0.9,
                                    }}
                                >
                                    {registration.result.finish_time} · Pace{' '}
                                    {registration.result.pace}
                                </div>
                            </div>
                            <div
                                className="f-mono"
                                style={{
                                    color: BRAND.cream,
                                    fontSize: 12,
                                    opacity: 0.95,
                                    textAlign: 'right',
                                }}
                            >
                                RANK UMUM #{registration.result.overall_rank}
                                <br />
                                RANK KATEGORI #
                                {registration.result.category_rank}
                                {registration.photo_count > 0 && (
                                    <>
                                        <br />
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 5,
                                            }}
                                        >
                                            <Camera className="size-3.5" />{' '}
                                            {registration.photo_count} FOTO
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminAnalytics({
    analytics,
    event,
}: {
    analytics: Analytics;
    event: EventInfo;
}) {
    const {
        overview,
        revenue_weekly,
        monthly,
        category_share,
        weekly_trend,
        weekly_area,
        top_stats,
        transactions,
    } = analytics;
    const [weekRange, setWeekRange] = useState(8);
    const [rangeOpen, setRangeOpen] = useState(false);
    const visibleWeekly = revenue_weekly.slice(-weekRange);
    const verifiedRatio =
        overview.total > 0
            ? Math.round((overview.verified / overview.total) * 100)
            : 0;
    const pendingRatio =
        overview.total > 0
            ? Math.round((overview.pending_verification / overview.total) * 100)
            : 0;
    const maxTotal = Math.max(
        1,
        ...visibleWeekly.map((d) => d.earn + d.expense),
    );
    const ticks = [
        ...new Set([
            maxTotal,
            Math.round((maxTotal * 3) / 4),
            Math.round(maxTotal / 2),
            Math.round(maxTotal / 4),
            0,
        ]),
    ];
    const categoryTotal = category_share.reduce((sum, d) => sum + d.value, 0);
    const statIcons = [Trophy, Backpack, Flag];

    return (
        <div className="flex flex-col gap-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0}
                    className="lg:col-span-2"
                >
                    <AnalyticsCard className="relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    {event.event_name ?? 'Dashboard'}
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Pantau statistik pendaftaran & pendapatan
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-8">
                                    <div>
                                        <p className="text-sm text-zinc-400">
                                            Pendapatan
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {formatRupiah(overview.revenue)}
                                            </span>
                                            <AnalyticsBadge
                                                positive={
                                                    overview.revenue_pct >= 0
                                                }
                                            >
                                                +{overview.revenue_pct}%
                                            </AnalyticsBadge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">
                                            Menunggu Verifikasi
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {overview.pending_verification}
                                            </span>
                                            <AnalyticsBadge
                                                positive={pendingRatio === 0}
                                            >
                                                {pendingRatio}%
                                            </AnalyticsBadge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-32 w-28 shrink-0">
                                <img
                                    src="/images/ecommerce.svg"
                                    alt="Ilustrasi pelari"
                                    className="h-full w-full scale-125 object-contain"
                                />
                            </div>
                        </div>
                    </AnalyticsCard>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={1}
                >
                    <AnalyticsCard className="flex h-full flex-col justify-between p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    Pendaftar 7 Hari Terakhir
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {overview.week_count}
                                    </span>
                                    <AnalyticsBadge
                                        positive={overview.week_pct >= 0}
                                    >
                                        +{overview.week_pct}%
                                    </AnalyticsBadge>
                                </div>
                            </div>
                            <IconButton>
                                <Calendar size={16} />
                            </IconButton>
                        </div>
                        <Link
                            href={registrationsIndex().url}
                            className="mt-4 flex w-fit items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Lihat Laporan <ArrowRight size={12} />
                        </Link>
                    </AnalyticsCard>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={2}
                >
                    <AnalyticsCard className="flex h-full flex-col justify-between p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                    Total Pendaftar
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {overview.total}
                                    </span>
                                    <AnalyticsBadge positive>
                                        {verifiedRatio}% lunas
                                    </AnalyticsBadge>
                                </div>
                            </div>
                            <IconButton>
                                <ShoppingBag size={16} />
                            </IconButton>
                        </div>
                        <Link
                            href={registrationsIndex().url}
                            className="mt-4 flex w-fit items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Lihat Laporan <ArrowRight size={12} />
                        </Link>
                    </AnalyticsCard>
                </motion.div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={3}
                    className="lg:col-span-2"
                >
                    <AnalyticsCard className="flex h-full flex-col">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    Grafik Pendapatan
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    Pendapatan terverifikasi vs menunggu
                                </p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setRangeOpen((open) => !open)
                                    }
                                    className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                                >
                                    {weekRange} Minggu Terakhir{' '}
                                    <ChevronDown size={14} />
                                </button>
                                {rangeOpen && (
                                    <div className="absolute top-full right-0 z-10 mt-2 w-36 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                                        {[4, 8, 12].map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => {
                                                    setWeekRange(range);
                                                    setRangeOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                                                    weekRange === range
                                                        ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                                                        : 'text-zinc-500'
                                                }`}
                                            >
                                                {range} Minggu
                                                {weekRange === range && (
                                                    <CheckCircle2 size={14} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
                            <div className="flex flex-col justify-center">
                                <div className="flex h-48">
                                    <div className="flex flex-col justify-between pr-3 pb-2 text-xs text-zinc-400">
                                        {ticks.map((tick, index) => (
                                            <span key={index}>
                                                {formatShortRupiah(tick)}
                                            </span>
                                        ))}
                                    </div>
                                    <RevenuePillChart
                                        data={visibleWeekly}
                                        height={192}
                                    />
                                </div>
                                <div className="mt-2 ml-8 flex justify-between text-xs text-zinc-400">
                                    {visibleWeekly.map((d) => (
                                        <span key={d.label}>{d.label}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                            <Grid3x3
                                                size={18}
                                                className="text-zinc-700 dark:text-zinc-300"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                {formatRupiah(overview.revenue)}
                                            </p>
                                            <p className="text-sm text-zinc-400">
                                                Total Pendapatan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-zinc-300" />
                                            <div>
                                                <p className="text-xs text-zinc-400">
                                                    Pendapatan bulan ini
                                                </p>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {formatRupiah(
                                                        overview.month_revenue,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-zinc-900" />
                                            <div>
                                                <p className="text-xs text-zinc-400">
                                                    Menunggu bayar bulan ini
                                                </p>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {formatRupiah(
                                                        overview.month_pending,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={paymentsIndex().url}
                                    className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    Lihat Laporan Lengkap
                                </Link>
                            </div>
                        </div>
                    </AnalyticsCard>
                </motion.div>

                <div className="flex flex-col gap-5">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={4}
                    >
                        <AnalyticsCard>
                            <div className="flex items-start justify-between">
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    Pendapatan Bulanan
                                </h3>
                                <IconButton>
                                    <BarChart3 size={16} />
                                </IconButton>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {formatRupiah(overview.month_revenue)}
                                </span>
                            </div>
                            <p className="text-sm">
                                <span
                                    className={`font-medium ${overview.revenue_pct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                                >
                                    {overview.revenue_pct >= 0 ? '+' : '-'}
                                    {overview.revenue_pct}%{' '}
                                </span>
                                <span className="text-zinc-400">
                                    dari bulan lalu
                                </span>
                            </p>
                            <div className="mt-3 h-20 w-full">
                                <AreaLineChart data={monthly} height={80} />
                            </div>
                        </AnalyticsCard>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={5}
                        className="flex-1"
                    >
                        <AnalyticsCard className="h-full">
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Distribusi Kategori
                            </h3>
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {formatRupiah(categoryTotal)}
                                    </p>
                                    <p className="text-sm">
                                        <span
                                            className={`font-medium ${overview.revenue_pct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                                        >
                                            {overview.revenue_pct >= 0
                                                ? '+'
                                                : '-'}
                                            {overview.revenue_pct}%{' '}
                                        </span>
                                        <span className="text-zinc-400">
                                            bulan ini
                                        </span>
                                    </p>
                                    <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-500">
                                        {category_share.map((entry) => (
                                            <span
                                                key={entry.name}
                                                className="flex items-center gap-1.5"
                                            >
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{
                                                        background: entry.color,
                                                    }}
                                                />{' '}
                                                {entry.name} ·{' '}
                                                {formatShortRupiah(entry.value)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-24 w-24">
                                    <DonutChart data={category_share} />
                                </div>
                            </div>
                        </AnalyticsCard>
                    </motion.div>
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={6}
                >
                    <AnalyticsCard className="h-full">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Statistik Mingguan
                        </h3>
                        <p className="text-sm text-zinc-400">
                            Aktivitas pendaftaran · 7 hari terakhir
                        </p>
                        <div className="mt-4 h-32 w-full">
                            <AreaLineChart data={weekly_area} height={128} />
                        </div>

                        <div className="mt-4 space-y-4">
                            {top_stats.map((item, index) => {
                                const Icon = statIcons[index] ?? BarChart3;

                                return (
                                    <div
                                        key={item.title}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                <Icon
                                                    size={16}
                                                    className="text-zinc-600 dark:text-zinc-300"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <AnalyticsBadge
                                            positive={item.value >= 0}
                                        >
                                            +{item.value}
                                            {item.suffix}
                                        </AnalyticsBadge>
                                    </div>
                                );
                            })}
                        </div>
                    </AnalyticsCard>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={7}
                >
                    <AnalyticsCard className="h-full">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Pendaftar per Hari
                        </h3>
                        <p className="text-sm text-zinc-400">
                            7 hari terakhir · lunas vs menunggu
                        </p>

                        <div className="mt-6 h-56 w-full">
                            <DualPillChart data={weekly_trend} height={210} />
                            <div className="mt-2 flex justify-between text-xs text-zinc-400">
                                {weekly_trend.map((d) => (
                                    <span key={d.day}>{d.day}</span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-zinc-900" />{' '}
                                Lunas
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-zinc-300" />{' '}
                                Menunggu
                            </span>
                        </div>
                    </AnalyticsCard>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={8}
                >
                    <AnalyticsCard className="flex h-full flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Transaksi Terbaru
                            </h3>
                            <MoreVertical size={16} className="text-zinc-400" />
                        </div>

                        <div className="mt-4 flex-1 space-y-4">
                            {transactions.map((t) => {
                                const Icon = STATUS_ICON[t.status] ?? Wallet;

                                return (
                                    <div
                                        key={t.code}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                    t.status === 'verified'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                                                        : t.status ===
                                                            'pending_verification'
                                                          ? 'bg-sky-50 text-sky-600 dark:bg-sky-950'
                                                          : t.status ===
                                                              'cancelled'
                                                            ? 'bg-rose-50 text-rose-500 dark:bg-rose-950'
                                                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950'
                                                }`}
                                            >
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {t.name}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {t.code} · {t.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-semibold ${t.positive ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-500'}`}
                                        >
                                            {t.positive ? '+' : '-'}
                                            {formatRupiah(t.amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <Link
                            href={paymentsIndex().url}
                            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Lihat Laporan Lengkap
                        </Link>
                    </AnalyticsCard>
                </motion.div>
            </div>
        </div>
    );
}

export default function Dashboard({
    is_admin,
    analytics,
    registration,
    event,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
                .f-display { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }
                .f-mono { font-family: 'JetBrains Mono', monospace; }
                .shimmer-btn { position: relative; overflow: hidden; }
                .shimmer-btn::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
                    transform: skewX(-20deg);
                    animation: shimmer 2.8s infinite;
                }
                @keyframes shimmer { 0% { left: -150%; } 60% { left: 150%; } 100% { left: 150%; } }
            `}</style>
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {is_admin && analytics ? (
                    <AdminAnalytics analytics={analytics} event={event} />
                ) : registration ? (
                    <RunnerDashboard
                        registration={registration}
                        event={event}
                    />
                ) : (
                    <div
                        style={{
                            background: BRAND.cream,
                            color: BRAND.black,
                            border: `2px solid ${BRAND.black}`,
                            borderRadius: 24,
                            padding: '48px 24px',
                            textAlign: 'center',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                    >
                        <Search
                            className="mx-auto size-10"
                            style={{ color: BRAND.red }}
                        />
                        <div
                            className="f-display"
                            style={{
                                fontSize: 22,
                                marginTop: 14,
                                color: BRAND.redDark,
                            }}
                        >
                            BELUM ADA PENDAFTARAN
                        </div>
                        <p
                            style={{
                                fontSize: 13,
                                marginTop: 8,
                                opacity: 0.7,
                                maxWidth: 420,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                        >
                            Kamu belum terdaftar di {EVENT_LINE(event)}. Daftar
                            sekarang atau cek status pendaftaranmu.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                                justifyContent: 'center',
                                marginTop: 22,
                            }}
                        >
                            <Link
                                href={home().url}
                                className="shimmer-btn"
                                style={{
                                    background: BRAND.red,
                                    color: BRAND.cream,
                                    padding: '12px 26px',
                                    borderRadius: 999,
                                    fontWeight: 800,
                                    fontSize: 13,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                Daftar Sekarang{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href={status().url}
                                style={{
                                    border: `2px solid ${BRAND.red}`,
                                    color: BRAND.red,
                                    padding: '12px 26px',
                                    borderRadius: 999,
                                    fontWeight: 800,
                                    fontSize: 13,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <Search className="size-4" /> Cek Status
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
