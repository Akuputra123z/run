import { Link, usePage } from '@inertiajs/react';
import { Timer, Users, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const HERO_IMAGE = '/images/run1.jpg';

const floatCard: Variants = {
    animate: (i = 0) => ({
        y: [0, -10, 0],
        transition: {
            duration: 5 + i,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: i * 0.6,
        },
    }),
};

function FloatingStat({
    icon: Icon,
    label,
    value,
    delta,
    className,
    index,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    delta: string;
    className?: string;
    index: number;
}) {
    return (
        <motion.div
            variants={floatCard}
            animate="animate"
            custom={index}
            className={`absolute w-40 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md ${className}`}
        >
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                    <Icon size={14} className="text-white" />
                </div>
                <p className="text-xs text-white/70">{label}</p>
            </div>
            <div className="mt-2 flex items-end justify-between">
                <span className="text-lg font-bold text-white">{value}</span>
                <span className="text-xs font-medium text-emerald-300">
                    {delta}
                </span>
            </div>
        </motion.div>
    );
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left — hero panel dengan foto event lari */}
            <div className="relative hidden w-1/2 overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between">
                <motion.div
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.1, ease: 'easeOut' as const }}
                    className="absolute inset-0"
                >
                    <img
                        src={HERO_IMAGE}
                        alt="Peserta berlari di event lari"
                        className="h-full w-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent" />

                <div className="relative z-10 flex items-center gap-2 px-12 pt-10">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/90">
                        <Waves size={16} className="text-white" />
                    </div>
                    <Link
                        href={home()}
                        className="text-sm font-semibold tracking-wide text-white"
                    >
                        {name}
                    </Link>
                </div>

                <div className="relative z-10 flex flex-1 items-end pb-16">
                    <div className="max-w-md px-12">
                        <motion.span
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur"
                        >
                            Race Day · 5K & 10K
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.08 }}
                            className="mt-4 text-4xl leading-tight font-semibold text-white"
                        >
                            Setiap langkah,
                            <br />
                            satu cerita di pesisir.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.16 }}
                            className="mt-4 text-sm leading-relaxed text-white/70"
                        >
                            Masuk untuk kelola pendaftaran, cek nomor BIB, dan
                            pantau status race pack Anda di {name}.
                        </motion.p>
                    </div>
                </div>

                <FloatingStat
                    icon={Users}
                    label="Pelari Terdaftar"
                    value="1,240"
                    delta="+18%"
                    index={0}
                    className="top-28 right-10"
                />
                <FloatingStat
                    icon={Timer}
                    label="Waktu Terbaik"
                    value="42:15"
                    delta="10K"
                    index={1}
                    className="top-[13rem] right-8"
                />

                <div className="relative z-10 px-12 pb-6 text-xs text-white/50">
                    © 2026 {name}. Foto: dokumentasi event.
                </div>
            </div>

            {/* Right — form panel */}
            <div className="flex w-full flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                            <AppLogoIcon className="size-5 fill-current text-white" />
                        </div>
                        <Link
                            href={home()}
                            className="text-sm font-semibold text-zinc-900"
                        >
                            {name}
                        </Link>
                    </div>

                    <h2 className="text-2xl font-semibold text-zinc-900">
                        {title}
                    </h2>
                    <p className="mt-1.5 text-sm text-zinc-400">
                        {description}
                    </p>

                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
