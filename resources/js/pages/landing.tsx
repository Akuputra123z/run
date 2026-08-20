import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    MapPin,
    Calendar,
    Menu,
    X,
    Facebook,
    Instagram,
    Youtube,
    MessageCircle,
    Ticket,
    Shirt,
    BookOpen,
    Gift,
    Medal,
    Clock,
    Car,
    Bike,
    Flag,
    Target,
    Ruler,
    Camera,
    SearchCheck,
    Trophy,
    Award,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { create, status } from '@/routes/registration';
import { publicMethod } from '@/routes/results';
import { lookup as photosLookup } from '@/routes/photos';

/* ---------------------------------------------------------
   TOKENS — matched to reference: red / black / yellow
   red     #C6242D   black   #141414
   red-dk  #8B1620   yellow  #FFC93C
   cream   #FFF6E5
--------------------------------------------------------- */

const RACE_DATE = new Date('2026-11-15T05:00:00+07:00');

const MENU_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Kategori', href: '#kategori', icon: Medal },
    { label: 'Jadwal', href: '#jadwal', icon: Calendar },
    { label: 'Rute', href: '#rute', icon: MapPin },
    { label: 'Size Chart', href: '#size-chart', icon: Ruler },
    { label: 'Galeri', href: '#galeri', icon: Camera },
    { label: 'Misi', href: '#misi', icon: Target },
];

const SERVICE_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Cek Status', href: status().url, icon: SearchCheck },
    { label: 'Hasil Race', href: publicMethod().url, icon: Trophy },
    { label: 'Foto BIB', href: photosLookup().url, icon: Camera },
    { label: 'Sertifikat', href: status().url, icon: Award },
];

type Ambassador = {
    name: string;
    role: string;
    color: string;
    photo_url: string | null;
};

type Reason = {
    icon: LucideIcon;
    label: string;
};

const REASONS: Reason[] = [
    { icon: Ticket, label: 'BIB Number' },
    { icon: Shirt, label: 'Running Jersey' },
    { icon: BookOpen, label: 'Race Guide' },
    { icon: Gift, label: 'Goodie Bag' },
    { icon: Medal, label: 'Finisher Medal' },
];

type Category = {
    id: number;
    name: string;
    distance: string;
    price: number;
};

type SizeSpec = {
    size: string;
    chest: number;
    body: number;
    sleeve: number;
    neck: number;
    opening: number;
};

type Gender = 'men' | 'women';

const SIZE_SPECS: Record<Gender, SizeSpec[]> = {
    men: [
        { size: 'S', chest: 48, body: 66, sleeve: 33, neck: 18.5, opening: 16.5 },
        { size: 'M', chest: 50, body: 68, sleeve: 34, neck: 19, opening: 17 },
        { size: 'L', chest: 53, body: 71, sleeve: 35, neck: 19.5, opening: 17.5 },
        { size: 'XL', chest: 56, body: 74, sleeve: 36, neck: 20, opening: 18 },
        { size: 'XXL', chest: 58.5, body: 77, sleeve: 37, neck: 20.5, opening: 18.5 },
    ],
    women: [
        { size: 'S', chest: 44, body: 60, sleeve: 30, neck: 17, opening: 15 },
        { size: 'M', chest: 46, body: 62, sleeve: 31, neck: 17.5, opening: 15.5 },
        { size: 'L', chest: 48, body: 64, sleeve: 32, neck: 18, opening: 16 },
        { size: 'XL', chest: 50, body: 66, sleeve: 33, neck: 18.5, opening: 16.5 },
        { size: 'XXL', chest: 52, body: 68, sleeve: 34, neck: 19, opening: 17 },
    ],
};

type GalleryItem = {
    url: string;
    label: string | null;
};

type EventSettings = {
    name: string | null;
    date: string | null;
    location: string | null;
    race_pack_dates: string[];
    race_pack_location: string | null;
    start_date: string | null;
    start_times: { distance: string; time: string }[];
    doorprize: {
        badge: string | null;
        event_name: string | null;
        title: string | null;
    };
};

type LandingProps = {
    categories: Category[];
    guestStars: Ambassador[];
    routeMaps: RouteMapItem[];
    gallery: {
        row_1: GalleryItem[];
        row_2: GalleryItem[];
    };
    event: EventSettings;
};

type Countdown = {
    d: number;
    h: number;
    m: number;
    s: number;
};

function useCountdown(target: Date): Countdown {
    const [left, setLeft] = useState<Countdown>({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        const tick = () => {
            const diff = Math.max(0, target.getTime() - Date.now());

            setLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff / 3600000) % 24),
                m: Math.floor((diff / 60000) % 60),
                s: Math.floor((diff / 1000) % 60),
            });
        };

        tick();
        const id = setInterval(tick, 1000);

        return () => clearInterval(id);
    }, [target]);

    return left;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const formatPrice = (value: number): string => 'Rp ' + value.toLocaleString('id-ID');

const MONTHS: Record<string, number> = {
    Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
    Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
};

/**
 * Parse an Indonesian event date string ("15 November 2026") into a Date,
 * falling back to the default race date when the value cannot be parsed.
 */
function parseEventDate(value: string | null): Date {
    const match = value?.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);

    if (match) {
        const [, day, month, year] = match;
        const monthIndex = MONTHS[month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()];

        if (monthIndex !== undefined) {
            return new Date(Number(year), monthIndex, Number(day), 5, 0, 0);
        }
    }

    return RACE_DATE;
}

type RouteMapItem = {
    id: number;
    title: string;
    description: string | null;
    photo_url: string | null;
    detail_photo_url: string | null;
};

function RouteCard({ r, i, onDetail }: { r: RouteMapItem; i: number; onDetail: (r: RouteMapItem) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'center' }}
        >
            {r.photo_url && (
                <img
                    src={r.photo_url}
                    alt={r.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '72%', height: 'auto', display: 'block', margin: '0 auto' }}
                />
            )}
            <div style={{ marginTop: 'auto' }}>
                <div className="f-display" style={{ color: '#FFC93C', fontSize: 28, margin: '18px 0 14px' }}>
                    {r.title}
                </div>
                <button
                    onClick={() => onDetail(r)}
                    style={{
                        display: 'inline-block',
                        background: 'transparent',
                        color: '#FFC93C',
                        border: '2px solid #FFC93C',
                        padding: '10px 30px',
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        letterSpacing: 0.5,
                    }}
                >
                    DETAIL RUTE
                </button>
            </div>
        </motion.div>
    );
}

function RouteDetailModal({ routeMap, onClose }: { routeMap: RouteMapItem; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(10,10,10,0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 640,
                    width: '100%',
                    background: '#141414',
                    borderRadius: 18,
                    padding: 18,
                    border: '2px solid rgba(255,255,255,0.15)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div className="f-display" style={{ color: '#FFC93C', fontSize: 20 }}>
                        {routeMap.title} — DETAIL RUTE
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#FFF6E5',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: 4,
                        }}
                        aria-label="Tutup"
                    >
                        <X size={22} />
                    </button>
                </div>
                {(routeMap.detail_photo_url ?? routeMap.photo_url) ? (
                    <img
                        src={routeMap.detail_photo_url ?? routeMap.photo_url ?? ''}
                        alt={`Detail rute ${routeMap.title}`}
                        style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', borderRadius: 12, display: 'block' }}
                    />
                ) : (
                    <div
                        style={{
                            minHeight: 220,
                            borderRadius: 12,
                            background: '#1d1d1d',
                            color: '#D9D0BB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                        }}
                    >
                        Foto detail belum tersedia.
                    </div>
                )}
            </div>
        </div>
    );
}

function PhotoCard({ g, i, total }: { g: GalleryItem; i: number; total: number }) {
    return (
        <div
            className="marquee-item"
            style={{
                width: 280,
                height: 200,
                flexShrink: 0,
                borderRadius: 18,
                background: '#141414',
                border: '2px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
            }}
        >
            <img
                src={g.url}
                alt={g.label ?? 'Foto galeri'}
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
            <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />
            <div
                style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    background: '#FFF6E5',
                    color: '#141414',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    padding: '5px 12px',
                    borderRadius: 999,
                }}
            >
                {g.label}
            </div>
            <div style={{ position: 'absolute', left: 16, bottom: 14 }}>
                <div className="f-mono" style={{ color: '#FFF6E5', fontSize: 10, opacity: 0.9 }}>
                    FOTO {String((i % total) + 1).padStart(2, '0')} — RUN 2026
                </div>
            </div>
            <div className="f-display" style={{ position: 'absolute', right: 14, bottom: -2, color: '#FFF6E5', fontSize: 52, opacity: 0.35 }}>
                {String((i % total) + 1).padStart(2, '0')}
            </div>
        </div>
    );
}

function BgLayer({ src, opacity = 0.3, tint }: { src: string; opacity?: number; tint?: string }) {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity,
                }}
            />
            {tint && <div style={{ position: 'absolute', inset: 0, background: tint }} />}
        </>
    );
}

export default function Landing({ categories, guestStars, routeMaps, gallery, event }: LandingProps) {
    const [detailRoute, setDetailRoute] = useState<RouteMapItem | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [genre, setGenre] = useState<Gender>('men');
    const headerRef = useRef<HTMLDivElement>(null);
    const countdown = useCountdown(parseEventDate(event.start_date));

    useEffect(() => {
        if (!menuOpen) {
return;
}

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
setMenuOpen(false);
}
        };
        const onDown = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
setMenuOpen(false);
}
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [menuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#141414', background: '#FFF6E5' }}>
            <Head title="Rembang CV WIYATA AMERTA Business Run 2026" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
                * { box-sizing: border-box; }
                html { scroll-padding-top: 72px; }
                .f-display { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }
                .f-mono { font-family: 'JetBrains Mono', monospace; }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
                @keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 0.9; } 100% { transform: translateY(420px) rotate(360deg); opacity: 0; } }
                .shimmer-btn { position: relative; overflow: hidden; }
                .shimmer-btn::after {
                    content: ''; position: absolute; top: 0; left: 0; height: 100%; width: 35%;
                    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
                    transform: translateX(-100%); animation: shimmer 2.4s ease-in-out infinite;
                }
                .grain { background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 3px 3px; }
                .menu-item:hover { background: rgba(198,36,45,0.12) !important; transform: translateY(-2px); border-color: rgba(198,36,45,0.4) !important; }
                .reason-icon { transition: transform 0.2s ease; }
                .reason-icon:hover { transform: scale(1.12); }
                ::selection { background: #FFC93C; color: #141414; }
                .marquee { overflow: hidden; }
                .marquee-track { display: flex; gap: 16px; width: max-content; animation: marquee 32s linear infinite; }
                .marquee-track.reverse { animation-direction: reverse; }
                .marquee:hover .marquee-track { animation-play-state: paused; }
                .marquee-item { transition: transform 0.3s ease; }
                .marquee-item:hover { transform: translateY(-6px) scale(1.02); }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .sec-cut-l { clip-path: polygon(0 32px, 100% 0, 100% 100%, 0 100%); }
                .sec-cut-r { clip-path: polygon(0 0, 100% 32px, 100% 100%, 0 100%); }
                .hero-photo { position: absolute; border: 3px solid #FFF6E5; border-radius: 14px; box-shadow: 0 18px 40px rgba(0,0,0,0.35); object-fit: cover; }
                @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.09); } }
                .hero-bg { animation: kenburns 20s ease-in-out infinite alternate; }
                @media (max-width: 1023px) { .hero-side { display: none !important; } }
                @media (max-width: 640px) {
                    .sec-cut-l { clip-path: polygon(0 20px, 100% 0, 100% 100%, 0 100%); }
                    .sec-cut-r { clip-path: polygon(0 0, 100% 20px, 100% 100%, 0 100%); }
                }
                .desktop-nav { display: flex !important; }
                .mobile-toggle { display: none !important; }
                .nav-link { position: relative; }
                .nav-link::after {
                    content: ''; position: absolute; left: 0; right: 0; bottom: -5px; height: 2px;
                    background: #FFC93C; transform: scaleX(0); transition: transform 0.2s ease; border-radius: 2px;
                }
                .nav-link:hover::after { transform: scaleX(1); }
                @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } .hero-bg { animation: none; } }
                @media (max-width: 1023px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                }
                @media (max-width: 860px) {
                    .grid-2 { grid-template-columns: 1fr !important; }
                    .grid-3 { grid-template-columns: 1fr !important; }
                    .amb-grid { grid-template-columns: repeat(3,1fr) !important; }
                    .reason-grid { grid-template-columns: repeat(2,1fr) !important; }
                    .schedule-art { margin-top: 0 !important; height: auto !important; }
                    .menu-panel { max-height: calc(100dvh - 60px); overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
                }
                @media (max-width: 720px) {
                    .topbar-row { padding: 12px 16px !important; gap: 8 !important; }
                    .menu-panel { padding: 16px 14px 22px !important; }
                    .menu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .menu-item { padding: 11px 12px !important; gap: 8 !important; font-size: 13px !important; }
                    .menu-item-icon { width: 30px !important; height: 30px !important; }
                }
                @media (max-width: 480px) {
                    .countdown-label { display: none !important; }
                    .countdown-pill { padding: 7px 12px !important; gap: 6px !important; }
                    .countdown-time { font-size: 11.5px !important; }
                    .countdown-days { display: none !important; }
                    .amb-grid { grid-template-columns: repeat(2,1fr) !important; }
                    .menu-btn { padding: 8px 13px !important; font-size: 12px !important; }
                }
                @media (max-width: 340px) {
                    .countdown-pill { padding: 6px 10px !important; }
                    .countdown-time { font-size: 10.5px !important; }
                    .menu-btn { padding: 7px 10px !important; }
                    .menu-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* TOP BAR */}
            <div
                ref={headerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 60,
                    background: scrolled ? 'linear-gradient(160deg, #8B1620 0%, #C6242D 60%, #A31E27 100%)' : 'transparent',
                    transition: 'background 0.3s ease',
                    boxShadow: scrolled ? '0 4px 18px rgba(0,0,0,0.28)' : 'none',
                }}
            >
                <div className="topbar-row" style={{ width: '100%', padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen}
                            className="menu-btn mobile-toggle"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: menuOpen ? 'rgba(255,201,60,0.16)' : 'rgba(255,255,255,0.08)',
                                border: menuOpen ? '1px solid rgba(255,201,60,0.55)' : '1px solid rgba(255,255,255,0.2)',
                                color: menuOpen ? '#FFC93C' : '#FFF6E5',
                                borderRadius: 999,
                                padding: '9px 18px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {menuOpen ? <X size={16} /> : <Menu size={16} />} {menuOpen ? 'Tutup' : 'Menu'}
                        </button>

                        <nav className="desktop-nav" aria-label="Navigasi utama" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {MENU_ITEMS.map((m) => (
                                <a
                                    key={m.label}
                                    href={m.href}
                                    className="nav-link"
                                    style={{
                                        color: '#FFF6E5',
                                        textDecoration: 'none',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {m.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div
                        className="countdown-pill"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            justifySelf: 'center',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 999,
                            padding: '9px 20px',
                        }}
                    >
                        <Clock size={14} color="#FFC93C" />
                        <span className="countdown-label" style={{ color: '#FFF6E5', fontSize: 12.5, fontWeight: 700 }}>Race Day:</span>
                        <span className="f-mono countdown-time" style={{ color: '#FFC93C', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {countdown.d}
                            <span className="countdown-days"> Days</span> {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
                        </span>
                    </div>

                    <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'end' }}>
                            <Link
                                href={status().url}
                                style={{
                                    color: '#FFF6E5',
                                    textDecoration: 'none',
                                    fontSize: 13,
                                    fontWeight: 800,
                                    padding: '9px 18px',
                                    borderRadius: 999,
                                    border: '1px solid rgba(255,255,255,0.35)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Cek Status
                            </Link>
                            <Link
                                href={publicMethod().url}
                                style={{
                                    color: '#FFC93C',
                                    textDecoration: 'none',
                                    fontSize: 13,
                                    fontWeight: 800,
                                    padding: '9px 18px',
                                    borderRadius: 999,
                                    border: '2px solid rgba(255,201,60,0.55)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Hasil
                            </Link>
                            <a
                                href={create().url}
                                className="shimmer-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: '#FFF6E5',
                                    color: '#8B1620',
                                    padding: '10px 24px',
                                    borderRadius: 999,
                                    fontWeight: 800,
                                    fontSize: 13,
                                    textDecoration: 'none',
                                    letterSpacing: 0.5,
                                }}
                            >
                                Daftar
                            </a>
                        </div>
                </div>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="menu-panel"
                        style={{
                            borderTop: '1px solid rgba(139,22,32,0.12)',
                            boxShadow: '0 24px 44px rgba(0,0,0,0.35)',
                            background: 'rgba(255,246,229,0.97)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <div style={{ width: '100%', padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="f-mono" style={{ fontSize: 10, letterSpacing: 2, color: '#C6242D', fontWeight: 700, marginBottom: 4 }}>
                                        MENU
                                    </div>
                                    <div className="f-display" style={{ color: '#141414', fontSize: 18 }}>
                                        CV WIYATA AMERTA BUSINESS RUN 2026
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    aria-label="Tutup menu"
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 999,
                                        background: 'rgba(139,22,32,0.08)',
                                        border: '1px solid rgba(139,22,32,0.25)',
                                        color: '#8B1620',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            <div>
                                <div className="f-mono" style={{ fontSize: 10, letterSpacing: 2, color: '#C6242D', fontWeight: 700, marginBottom: 10 }}>
                                    INFORMASI
                                </div>
                                                                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                                    {MENU_ITEMS.map((m) => {
                                        const Icon = m.icon;

                                        return (
                                            <a
                                                key={m.label}
                                                href={m.href}
                                                onClick={() => setMenuOpen(false)}
                                                className="menu-item"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    padding: '13px 18px',
                                                    borderRadius: 999,
                                                    background: 'rgba(139,22,32,0.05)',
                                                    border: '1px solid rgba(139,22,32,0.12)',
                                                    color: '#8B1620',
                                                    textDecoration: 'none',
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <div
                                                    className="menu-item-icon"
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: 999,
                                                        background: 'rgba(198,36,45,0.12)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Icon size={16} color="#C6242D" />
                                                </div>
                                                {m.label}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="f-mono" style={{ fontSize: 10, letterSpacing: 2, color: '#C6242D', fontWeight: 700, marginBottom: 10 }}>
                                    LAYANAN
                                </div>
                                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                                    {SERVICE_ITEMS.map((s) => {
                                        const Icon = s.icon;

                                        return (
                                            <Link
                                                key={s.label}
                                                href={s.href}
                                                onClick={() => setMenuOpen(false)}
                                                className="menu-item"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                    padding: '13px 18px',
                                                    borderRadius: 999,
                                                    background: 'rgba(198,36,45,0.07)',
                                                    border: '1px solid rgba(198,36,45,0.18)',
                                                    color: '#C6242D',
                                                    textDecoration: 'none',
                                                    fontSize: 14,
                                                    fontWeight: 800,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <div
                                                    className="menu-item-icon"
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: 999,
                                                        background: 'rgba(198,36,45,0.12)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Icon size={16} color="#C6242D" />
                                                </div>
                                                {s.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <a
                                href={create().url}
                                onClick={() => setMenuOpen(false)}
                                className="shimmer-btn"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '15px 26px',
                                    borderRadius: 999,
                                    background: '#C6242D',
                                    color: '#FFF6E5',
                                    fontSize: 14,
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                }}
                            >
                                Daftar Sekarang
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* HERO */}
            <section
                style={{
                    position: 'relative',
                    background: 'linear-gradient(160deg, #8B1620 0%, #C6242D 55%, #A31E27 100%)',
                    overflow: 'hidden',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '110px 24px 60px',
                }}
            >
                <img
                    src="/images/hero-runner.jpg"
                    alt="Pelari melaju penuh tenaga"
                    className="hero-bg"
                    fetchPriority="high"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
                />
                {/* red gradient overlay untuk menjaga tone brand dan keterbacaan */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(139,22,32,0.78) 0%, rgba(198,36,45,0.35) 50%, rgba(163,30,39,0.82) 100%)' }} />
                <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                {/* faint diagonal streak pattern like reference collage */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 40px)' }} />

                {/* side collage photos */}
                <img
                    src="/images/hero-1476480862126-209bfaa8edc8.jpg"
                    alt="Pelari berlatih di pagi hari"
                    className="hero-photo hero-side"
                    style={{ left: 24, top: '54%', transform: 'translateY(-50%) rotate(-6deg)', width: 240, height: 170 }}
                />
                <img
                    src="/images/hero-1519677100203-a0e668c92439.jpg"
                    alt="Para pelari memadati jalanan kota"
                    className="hero-photo hero-side"
                    style={{ right: 24, top: '46%', transform: 'translateY(-50%) rotate(5deg)', width: 240, height: 170 }}
                />

                <motion.div
                    initial={{ y: 30, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{
                        position: 'relative',
                        maxWidth: 640,
                        width: '100%',
                        margin: '0 auto',
                        borderRadius: 48,
                        border: '3px solid #FFF6E5',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                        background: 'linear-gradient(160deg, #8B1620 0%, #C6242D 55%, #A31E27 100%)',
                        overflow: 'hidden',
                    }}
                >
                    <img
                        src="/storage/card.png"
                        alt="CV WIYATA AMERTA BUSINESS RUN 2026 — Total hadiah dan doorprize Rp. 150 juta"
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                </motion.div>

                <a
                    href={create().url}
                    className="shimmer-btn"
                    style={{
                        display: 'inline-block',
                        background: '#FFF6E5',
                        color: '#8B1620',
                        padding: '14px 40px',
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 14,
                        textDecoration: 'none',
                        letterSpacing: 0.5,
                        marginTop: 34,
                    }}
                >
                    DAFTAR DI SINI
                </a>

                <div style={{ textAlign: 'center', color: '#FFF6E5', opacity: 0.85, fontSize: 13, fontWeight: 600, marginTop: 18 }}>
                    Pantau terus akun resmi kami agar tidak ketinggalan info pendaftaran!
                </div>
            </section>

            {/* MISSION */}
            <section id="misi" className="sec-cut-l" style={{ padding: '90px 24px', background: '#FFC93C', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g1.jpg" opacity={0.3} tint="rgba(255,201,60,0.65)" />
                <div className="grid-2" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 56, alignItems: 'start', position: 'relative' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        <div className="f-display" style={{ fontSize: 'clamp(34px, 5vw, 54px)', color: '#141414', lineHeight: 1, marginBottom: 8 }}>
                            OUR MISSION
                        </div>
                        <div className="f-display" style={{ fontSize: 17, color: '#8B1620', marginBottom: 28, letterSpacing: 0.5 }}>
                            TAHUN PERTAMA, LANGKAH PANJANG UNTUK PESISIR
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#2b2620', marginBottom: 16 }}>
                           CV WIYATA AMERTA Business Run hadir bukan sekadar ajang lari, melainkan cara memperkenalkan pesisir utara Rembang — dari pasir Karang Jahe hingga gang-gang tua Lasem — kepada pelari dari seluruh Jawa Tengah dan sekitarnya.
                        </p>
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#2b2620', marginBottom: 16 }}>
                            Setiap kilometer yang ditempuh bercerita: garam yang dipanen warga pesisir, batik "abang branang" yang jadi identitas Lasem, hingga jejak R.A. Kartini yang tak jauh dari garis finish.
                        </p>
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#2b2620' }}>
                            Pelibatan UMKM pesisir jadi bagian penting dari ekosistem event ini — dari pengrajin batik lokal untuk desain jersey, hingga pelaku kuliner pesisir di area finish.
                        </p>
                    </motion.div>

                    <motion.img
                        src="/storage/run.jpg"
                        alt="Run"
                        initial={{ opacity: 0, x: 20, rotate: 2 }}
                        whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 60px 24px 60px', border: '4px solid #FFF6E5', display: 'block' }}
                    />
                </div>
            </section>

            {/* GUEST STAR */}
            <section id="duta" className="sec-cut-r" style={{ padding: '90px 24px', background: '#141414', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g2.jpg" opacity={0.32} tint="rgba(28,18,16,0.55)" />
                <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="f-display"
                        style={{ color: '#FFF6E5', fontSize: 'clamp(30px, 5vw, 48px)', textAlign: 'center', marginBottom: 56 }}
                    >
                        GUEST STAR
                    </motion.div>
                    <div className="amb-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18 }}>
                        {guestStars.map((a, i) => (
                            <motion.div
                                key={a.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: i * 0.07 }}
                                whileHover={{ y: -6 }}
                                style={{ textAlign: 'center' }}
                            >
                                {a.photo_url ? (
                                    <img
                                        src={a.photo_url}
                                        alt={a.name}
                                        loading="lazy"
                                        decoding="async"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 14,
                                            marginBottom: 12,
                                            display: 'block',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            height: 120,
                                            borderRadius: 14,
                                            background: `linear-gradient(160deg, ${a.color}, #141414)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 12,
                                        }}
                                    >
                                        <div className="f-display" style={{ color: '#FFF6E5', fontSize: 30, opacity: 0.85 }}>
                                            {a.name.split(' ').map((w) => w[0]).join('')}
                                        </div>
                                    </div>
                                )}
                                <div style={{ color: '#FFF6E5', fontWeight: 800, fontSize: 12.5 }}>{a.name}</div>
                                <div style={{ color: '#FFC93C', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, marginTop: 4, whiteSpace: 'pre-line' }}>{a.role}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REASON TO RUN */}
            <section className="sec-cut-l" style={{ padding: '90px 24px', background: '#C6242D', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/hero-1519677100203-a0e668c92439.jpg" opacity={0.25} tint="rgba(198,36,45,0.6)" />
                <div className="grid-2" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 40, alignItems: 'center', position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <div
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'pulse 3s ease-in-out infinite',
                            }}
                        >
                            <svg width="120" height="150" viewBox="0 0 120 150">
                                <circle cx="60" cy="22" r="16" fill="#FFF6E5" />
                                <path d="M60 40 L45 90 L30 140 M60 40 L78 85 L95 130" stroke="#FFF6E5" strokeWidth="10" strokeLinecap="round" fill="none" />
                                <path d="M60 55 L30 70 M60 55 L92 60" stroke="#FFF6E5" strokeWidth="9" strokeLinecap="round" fill="none" />
                                <rect x="42" y="40" width="36" height="42" rx="10" fill="#FFC93C" />
                            </svg>
                        </div>
                    </motion.div>

                    <div>
                        <div className="f-display" style={{ color: '#FFF6E5', fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.05, marginBottom: 8 }}>
                            REASON TO RUN WITH US
                        </div>
                        <div style={{ color: '#FFC93C', fontWeight: 800, fontSize: 14, letterSpacing: 1, marginBottom: 40 }}>
                            LEBIH DARI SEKADAR BERLARI
                        </div>
                        <div className="reason-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
                            {REASONS.map((r, i) => {
                                const Icon = r.icon;

                                return (
                                    <motion.div
                                        key={r.label}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.08 }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <div
                                            className="reason-icon"
                                            style={{
                                                width: 84,
                                                height: 84,
                                                borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.14)',
                                                border: '2px solid rgba(255,255,255,0.35)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 12px',
                                            }}
                                        >
                                            <Icon size={30} color="#FFF6E5" />
                                        </div>
                                        <div style={{ color: '#FFF6E5', fontSize: 12, fontWeight: 700 }}>{r.label}</div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* SCHEDULE */}
            <section id="jadwal" className="sec-cut-r" style={{ padding: '90px 24px', background: '#141414', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g3.jpg" opacity={0.32} tint="rgba(28,18,16,0.55)" />
                <div className="f-display" style={{ color: '#FFF6E5', fontSize: 'clamp(30px, 5vw, 46px)', textAlign: 'center', marginBottom: 40, maxWidth: 1160, margin: '0 auto 40px', position: 'relative' }}>
                    EVENT SCHEDULE
                </div>
                <div className="grid-2" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 48, alignItems: 'center', position: 'relative' }}>
                    <div>

                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(8px)',
                                border: '2px solid #FFF6E5',
                                borderRadius: '3rem',
                                padding: '16px 22px',
                                marginBottom: 16,
                                transition: 'transform 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    flexShrink: 0,
                                    borderRadius: 999,
                                    background: 'rgba(255,201,60,0.15)',
                                    border: '2px solid #FFC93C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ticket size={28} color="#FFC93C" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#FFF6E5', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Pengambilan Race Pack</div>
                                {event.race_pack_dates.map((d) => (
                                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFF6E5', opacity: 0.85, fontSize: 12, marginBottom: 4 }}>
                                        <Calendar size={12} color="#FFC93C" /> {d}
                                    </div>
                                ))}
                                {event.race_pack_location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFF6E5', opacity: 0.85, fontSize: 12, marginTop: 5 }}>
                                        <MapPin size={12} color="#FFC93C" /> {event.race_pack_location}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(8px)',
                                border: '2px solid #FFF6E5',
                                borderRadius: '3rem',
                                padding: '16px 22px',
                                transition: 'transform 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    flexShrink: 0,
                                    borderRadius: 999,
                                    background: 'rgba(255,201,60,0.15)',
                                    border: '2px solid #FFC93C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Flag size={28} color="#FFC93C" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#FFF6E5', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Waktu Start</div>
                                {event.start_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFF6E5', opacity: 0.85, fontSize: 12, marginBottom: 4 }}>
                                        <Calendar size={12} color="#FFC93C" /> {event.start_date}
                                    </div>
                                )}
                                {event.start_times.map(({ distance, time }) => (
                                    <div key={distance} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFF6E5', opacity: 0.85, fontSize: 12, marginBottom: 4 }}>
                                        <Clock size={12} color="#FFC93C" /> {distance} — {time}
                                    </div>
                                ))}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFF6E5', opacity: 0.85, fontSize: 12, marginTop: 5 }}>
                                    <MapPin size={12} color="#FFC93C" /> Pantai Karang Jahe
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="schedule-art" style={{ position: 'relative', height: 340, alignSelf: 'flex-start', marginTop: 110 }}>
                        <motion.img
                            src="/images/event-artist.png"
                            alt="Event Artist"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: 18,
                                display: 'block',
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* CATEGORIES */}
            <section id="kategori" className="sec-cut-l" style={{ padding: '90px 24px', background: '#FFF6E5', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g4.jpg" opacity={0.22} tint="rgba(255,246,229,0.75)" />
                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="f-display"
                        style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', textAlign: 'center', marginBottom: 50 }}
                    >
                        PILIH KATEGORI
                    </motion.div>
                    <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
                        {categories.map((c, i) => (
                            <motion.div
                                key={c.distance}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -6 }}
                                style={{ background: '#141414', borderRadius: 20, padding: 30, textAlign: 'center' }}
                            >
                                <div className="f-display" style={{ color: '#FFC93C', fontSize: 42 }}>{c.distance}</div>
                                <div style={{ color: '#FFF6E5', fontWeight: 700, fontSize: 15, marginBottom: 18 }}>{c.name}</div>
                                <div className="f-mono" style={{ color: '#FFF6E5', fontWeight: 700, fontSize: 16, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
                                    {formatPrice(c.price)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <svg
                style={{ display: 'block', width: '100%', position: 'relative', zIndex: 5, marginTop: -2 }}
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path fill="#FFC93C" d="M0,64L120,80C240,96,480,128,720,133.3C960,139,1200,117,1320,106.7L1440,96L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z" />
            </svg>

            {/* SIZE CHART */}
            <section id="size-chart" className="sec-cut-r" style={{ padding: '90px 24px', background: '#FFC93C', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g5.jpg" opacity={0.25} tint="rgba(255,201,60,0.68)" />
                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
                    <div className="f-display" style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', textAlign: 'center', marginBottom: 6 }}>
                        SIZE CHART — JERSEY
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, marginBottom: 30 }}>Pilih Genre &amp; Size Chart Kamu</div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 44 }}>
                        {(['men', 'women'] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGenre(g)}
                                style={{
                                    padding: '11px 30px',
                                    borderRadius: 999,
                                    border: '2px solid #141414',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    background: genre === g ? '#C6242D' : '#FFF6E5',
                                    color: genre === g ? '#FFF6E5' : '#141414',
                                }}
                            >
                                {g === 'men' ? 'MEN' : 'WOMEN'}
                            </button>
                        ))}
                    </div>

                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 40, alignItems: 'center' }}>
                        <motion.div key={genre + '-shirt'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
                            <svg width="220" height="260" viewBox="0 0 220 260">
                                <path
                                    d="M60 30 L20 55 L35 90 L55 78 L55 240 L165 240 L165 78 L185 90 L200 55 L160 30 L140 20 Q110 40 80 20 Z"
                                    fill="#C6242D"
                                    stroke="#141414"
                                    strokeWidth="3"
                                />
                                <circle cx="110" cy="30" r="14" fill="#FFF6E5" stroke="#141414" strokeWidth="3" />
                            </svg>
                        </motion.div>

<motion.div
                            key={genre}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            style={{ background: '#fff', borderRadius: 24, padding: '24px 18px 14px', boxShadow: '0 18px 40px rgba(0,0,0,0.18)', border: '2px solid #141414', minWidth: 0 }}
                        >
                            <h3 style={{ textAlign: 'center', fontWeight: 900, fontSize: 17, marginBottom: 10 }}>
                                Specs Running {genre === 'men' ? 'Men' : 'Women'}
                            </h3>
                            <div style={{ background: '#C6242D', color: '#FFF6E5', textAlign: 'center', fontWeight: 800, fontSize: 13, padding: '9px 12px', borderRadius: 10, marginBottom: 12, letterSpacing: 0.5 }}>
                                Jersey - Slim Fit
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 460 }}>
                                <thead>
                                    <tr style={{ background: '#f1f1f1' }}>
                                        <th style={{ padding: '12px 14px', textAlign: 'left', color: '#141414' }}>Size (Cm)</th>
                                        {SIZE_SPECS[genre].map((r) => (
                                            <th key={r.size} className="f-mono" style={{ padding: '12px 10px', color: '#8B1620' }}>
                                                {r.size}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(
                        [
                            ['Chest Width', 'chest'],
                            ['Body Width', 'body'],
                            ['Sleeve Length', 'sleeve'],
                            ['Neck Opening', 'neck'],
                            ['Sleeve Opening', 'opening'],
                        ] as const
                    ).map(([label, key], ri) => (
                                        <tr key={key} style={{ borderBottom: ri === 4 ? 'none' : '1px solid rgba(20,20,20,0.1)' }}>
                                            <td style={{ padding: '10px 14px', fontWeight: 700 }}>{label}</td>
                                            {SIZE_SPECS[genre].map((r) => (
                                                <td key={r.size} className="f-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>
                                                    {r[key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                            <p style={{ textAlign: 'center', fontSize: 11.5, color: '#666', margin: '12px 0 4px' }}>
                                Catatan: semua ukuran dalam sentimeter, toleransi 1 - 1.5 cm.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* RUNNING ROUTE */}
            <section id="rute" className="sec-cut-l" style={{ padding: '90px 24px 110px', background: '#141414', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g6.jpg" opacity={0.32} tint="rgba(28,18,16,0.55)" />
                <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="f-display"
                        style={{ color: '#FFF6E5', fontSize: 'clamp(28px, 4.5vw, 46px)', textAlign: 'center', marginBottom: 64 }}
                    >
                        RUNNING ROUTE
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56 }}>
                        {routeMaps.map((r, i) => (
                            <RouteCard key={r.id} r={r} i={i} onDetail={setDetailRoute} />
                        ))}
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <section id="galeri" className="sec-cut-r" style={{ padding: '90px 0', background: '#C6242D', overflow: 'hidden', position: 'relative' }}>
                <BgLayer src="/images/gallery/g7.jpg" opacity={0.2} tint="rgba(198,36,45,0.62)" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="f-display"
                    style={{ color: '#FFF6E5', fontSize: 'clamp(28px, 4.5vw, 46px)', textAlign: 'center', marginBottom: 44, padding: '0 24px', position: 'relative' }}
                >
                    EVENT GALLERY
                </motion.div>
                <div className="marquee" style={{ position: 'relative' }}>
                    <div className="marquee-track">
                        {[...gallery.row_1, ...gallery.row_1].map((g, i) => (
                            <PhotoCard key={i} g={g} i={i} total={gallery.row_1.length} />
                        ))}
                    </div>
                </div>
                <div className="marquee" style={{ marginTop: 34, position: 'relative' }}>
                    <div className="marquee-track reverse">
                        {[...gallery.row_2, ...gallery.row_2].map((g, i) => (
                            <PhotoCard key={i} g={g} i={i} total={gallery.row_2.length} />
                        ))}
                    </div>
                </div>
            </section>

            {/* DOORPRIZE */}
            <section id="daftar" className="sec-cut-l" style={{ padding: '90px 24px', background: '#141414', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g8.jpg" opacity={0.32} tint="rgba(28,18,16,0.58)" />
                <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                    <div className="f-display" style={{ color: '#FFF6E5', fontSize: 'clamp(28px, 4.5vw, 46px)', marginBottom: 40 }}>
                        DOORPRIZE
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{ background: '#FFC93C', borderRadius: 26, padding: '36px 30px', marginBottom: 46, position: 'relative' }}
                    >
                        <div style={{ display: 'inline-block', background: '#FFF6E5', color: '#8B1620', fontSize: 11.5, fontWeight: 800, padding: '6px 18px', borderRadius: 999, marginBottom: 20, letterSpacing: 0.5 }}>
                            {event.doorprize.badge ?? 'FINISH HAPPY, HADIAH MENANTI'}
                        </div>
                        <div className="f-display" style={{ color: '#8B1620', fontSize: 'clamp(13px, 2vw, 15px)', marginBottom: 6, letterSpacing: 3 }}>
                            {event.doorprize.event_name ?? 'REMBANG CV WIYATA AMERTA BUSINESS RUN 2026'}
                        </div>
                        <div className="f-display" style={{ color: '#141414', fontSize: 'clamp(38px, 7vw, 64px)', lineHeight: 1, marginBottom: 22 }}>
                            {event.doorprize.title ?? 'DOORPRIZE'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                            <div style={{ width: 90, height: 90, borderRadius: 18, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bike size={40} color="#FFC93C" />
                            </div>
                            <div style={{ width: 90, height: 90, borderRadius: 18, background: '#8B1620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Car size={40} color="#FFF6E5" />
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#5c4c1f', marginTop: 16, fontStyle: 'italic' }}>*Gambar hanya ilustrasi</div>
                    </motion.div>

                    <div style={{ color: '#FFF6E5', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>REGISTER</div>
                    <div style={{ color: '#FFF6E5', opacity: 0.7, fontSize: 13, marginBottom: 26, fontWeight: 600 }}>PILIH KATEGORI JARAK KAMU</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {categories.map((c, i) => (
                            <a
                                key={c.distance}
                                href={create().url}
                                className="shimmer-btn"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    background: i % 2 === 0 ? '#C6242D' : '#FFC93C',
                                    color: i % 2 === 0 ? '#FFF6E5' : '#141414',
                                    padding: '18px 30px',
                                    borderRadius: 999,
                                    textDecoration: 'none',
                                    fontWeight: 800,
                                    fontSize: 15,
                                }}
                            >
                                <span>
                                    {c.distance} <span style={{ opacity: 0.8, fontWeight: 600 }}>· {c.name}</span>
                                </span>
                                <span className="f-mono">{formatPrice(c.price)}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: '#0c0c0c', padding: '48px 24px 28px', position: 'relative', overflow: 'hidden' }}>
                <BgLayer src="/images/gallery/g9.jpg" opacity={0.22} tint="rgba(28,18,16,0.5)" />
                <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
                    <div className="f-display" style={{ color: '#FFF6E5', fontSize: 16 }}>
                        CV WIYATA AMERTA BUSINESS RUN <span style={{ color: '#FFC93C' }}>2026</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {[
                            { icon: Instagram, href: 'https://www.instagram.com/', label: 'Instagram' },
                            { icon: Facebook, href: 'https://www.facebook.com/', label: 'Facebook' },
                            { icon: Youtube, href: 'https://www.youtube.com/', label: 'YouTube' },
                            { icon: MessageCircle, href: 'https://wa.me/', label: 'WhatsApp' },
                        ].map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFF6E5',
                                    opacity: 0.8,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Icon size={15} />
                            </a>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', color: '#FFF6E5', opacity: 0.65, fontSize: 12.5, width: '100%' }}>
                        <MapPin size={14} /> Pantai Karang Jahe, Rembang · © 2026
                    </div>
                </div>
            </footer>
            {detailRoute && <RouteDetailModal routeMap={detailRoute} onClose={() => setDetailRoute(null)} />}
        </div>
    );
}