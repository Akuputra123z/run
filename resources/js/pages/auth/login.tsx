import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.15 + i * 0.07,
            duration: 0.45,
            ease: 'easeOut' as const,
        },
    }),
};

const inputStyles =
    'h-11 rounded-xl border-zinc-200 bg-white pl-10 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 dark:bg-white/10 dark:border-zinc-800 dark:text-white';

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <motion.div initial="hidden" animate="show">
                <PasskeyVerify
                    label="Masuk dengan passkey"
                    loadingLabel="Memverifikasi..."
                    separator="atau lanjutkan dengan email"
                />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                <motion.div
                                    variants={fadeUp}
                                    custom={0}
                                    className="grid gap-1.5"
                                >
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium text-zinc-700"
                                    >
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-zinc-400"
                                        />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@perusahaan.com"
                                            className={inputStyles}
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </motion.div>

                                <motion.div
                                    variants={fadeUp}
                                    custom={1}
                                    className="grid gap-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium text-zinc-700"
                                        >
                                            Kata sandi
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-zinc-400"
                                        />
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className={inputStyles}
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </motion.div>

                                <motion.div
                                    variants={fadeUp}
                                    custom={2}
                                    className="flex items-center gap-2 pt-1"
                                >
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm text-zinc-600"
                                    >
                                        Ingat saya di perangkat ini
                                    </Label>
                                </motion.div>

                                <motion.div variants={fadeUp} custom={3}>
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full rounded-xl bg-zinc-900 px-4 text-white hover:bg-zinc-800 active:scale-[0.99]"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        Masuk
                                        <ArrowRight size={15} />
                                    </Button>
                                </motion.div>
                            </div>

                            <motion.div
                                variants={fadeUp}
                                custom={4}
                                className="text-center text-sm text-zinc-500"
                            >
                                Belum punya akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-medium text-zinc-900 hover:underline"
                                >
                                    Daftar sekarang
                                </TextLink>
                            </motion.div>
                        </>
                    )}
                </Form>
            </motion.div>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali, pelari!',
    description: 'Masuk untuk kelola pendaftaran dan race pack Anda.',
};
