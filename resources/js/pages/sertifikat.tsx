import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';

type Certificate = {
    name: string;
    code: string;
    category: string;
    race_number: string;
    finish_time: string;
    pace: string;
    overall_rank: number;
};

type Props = {
    certificate: Certificate;
};

export default function Sertifikat({ certificate }: Props) {
    return (
        <>
            <Head title={`Sertifikat - ${certificate.name}`} />
            <div className="flex min-h-screen flex-col items-center gap-6 bg-neutral-200 p-6 print:bg-white print:p-0">
                <button
                    onClick={() => window.print()}
                    className="hidden items-center gap-2 rounded-lg bg-[#C6242D] px-5 py-2.5 text-sm font-bold text-[#FFF6E5] print:hidden md:flex"
                >
                    <Printer className="size-4" />
                    Cetak / Simpan PDF
                </button>

                <div
                    className="w-full max-w-[297mm] bg-white shadow-2xl print:shadow-none"
                    style={{ aspectRatio: '297 / 210' }}
                >
                    <div className="flex h-full flex-col items-center justify-center gap-1 border-[6px] border-double border-[#C6242D] p-6 text-center">
                        <div className="f-display text-[#C6242D]" style={{ fontSize: 26, letterSpacing: 6 }}>
                            CV WIYATA AMERTA BUSINESS RUN 2026
                        </div>
                        <div className="f-display text-neutral-500" style={{ fontSize: 13, letterSpacing: 4 }}>
                            PANTAl KARANG JAHE · REMBANG · 15 NOVEMBER 2026
                        </div>

                        <div className="f-display text-neutral-800" style={{ fontSize: 15, letterSpacing: 3, marginTop: 22 }}>
                            SERTIFIKAT FINISHER
                        </div>

                        <div className="text-neutral-400" style={{ fontSize: 12, marginTop: 14 }}>
                            Diberikan kepada
                        </div>
                        <div className="f-display text-[#141414]" style={{ fontSize: 44, lineHeight: 1.1 }}>
                            {certificate.name.toUpperCase()}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[13px] text-neutral-600">
                            <span>
                                Kategori <b className="text-[#C6242D]">{certificate.category}</b>
                            </span>
                            <span>
                                BIB <b className="font-mono">{certificate.race_number}</b>
                            </span>
                            <span>
                                Waktu <b className="font-mono">{certificate.finish_time}</b>
                            </span>
                            <span>
                                Pace <b className="font-mono">{certificate.pace}</b>
                            </span>
                            <span>
                                Rank Umum <b>#{certificate.overall_rank}</b>
                            </span>
                        </div>

                        <div className="mt-6 flex w-full items-end justify-between px-8 text-[11px] text-neutral-500">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-40 border-t border-neutral-400 pt-1">Ketua Panitia</div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-40 border-t border-neutral-400 pt-1">CV WIYATA AMERTA Kab. Rembang</div>
                            </div>
                        </div>

                        <div className="font-mono text-[10px] text-neutral-400" style={{ marginTop: 14 }}>
                            Verifikasi keaslian: {certificate.code}
                        </div>
                    </div>
                </div>

                <p className="max-w-md text-center text-xs text-neutral-500 print:hidden">
                    Gunakan tombol cetak, lalu pilih "Save as PDF" untuk menyimpan sertifikat.
                </p>
            </div>
            <style>{'.f-display { font-family: "Anton", sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }'}</style>
            <style>{'@media print { @page { size: A4 landscape; margin: 0; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }'}</style>
        </>
    );
}