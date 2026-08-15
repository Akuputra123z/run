import { Head, router, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { home } from '@/routes';
import { publicMethod } from '@/routes/results';

type ResultRow = {
    code: string;
    name: string;
    category: string;
    race_number: string | null;
    finish_time: string;
    pace: string;
    overall_rank: number;
    category_rank: number;
};

type Props = {
    results: {
        data: ResultRow[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string;
};

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Hasil({ results, search }: Props) {
    const filters = useForm({ search });

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(publicMethod().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Hasil Race" />
            <div className="min-h-screen" style={{ background: '#FFF6E5' }}>
                <div style={{ background: 'linear-gradient(160deg, #8B1620 0%, #C6242D 55%, #A31E27 100%)', padding: '44px 20px 56px' }}>
                    <div className="mx-auto max-w-5xl">
                        <a href={home().url} className="f-display" style={{ fontSize: 13, letterSpacing: 2, color: 'rgba(255,246,229,0.7)' }}>
                            ← CV WIYATA AMERTA BUSINESS RUN 2026
                        </a>
                        <div className="f-display" style={{ fontSize: 'clamp(34px, 6vw, 54px)', color: '#FFC93C', lineHeight: 1, marginTop: 10 }}>
                            Hasil Race
                        </div>
                        <div style={{ fontSize: 14, color: 'rgba(255,246,229,0.85)', marginTop: 8 }}>
                            Pantai Karang Jahe · Rembang · 15 November 2026
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl" style={{ marginTop: -28, padding: '0 20px 60px' }}>
                    <div style={{ background: '#141414', borderRadius: 16, padding: 16, boxShadow: '0 18px 40px rgba(0,0,0,0.18)' }}>
                        <form onSubmit={applySearch} style={{ display: 'flex', gap: 10 }}>
                            <input
                                value={filters.data.search}
                                onChange={(e) => filters.setData('search', e.target.value)}
                                placeholder="Cari nama / kode / BIB…"
                                style={{
                                    flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: 10, padding: '11px 14px', color: '#FFF6E5', fontSize: 13.5, outline: 'none',
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    background: '#C6242D', border: 'none', borderRadius: 10, padding: '0 18px',
                                    color: '#FFF6E5', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                                }}
                            >
                                <Search size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                                Cari
                            </button>
                        </form>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 16, marginTop: 18, overflow: 'hidden', boxShadow: '0 10px 30px rgba(20,20,20,0.08)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13.5 }}>
                                <thead>
                                    <tr style={{ background: '#141414', color: '#FFF6E5' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, letterSpacing: 1, fontWeight: 700 }}>RANK</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, letterSpacing: 1, fontWeight: 700 }}>PESERTA</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, letterSpacing: 1, fontWeight: 700 }}>KATEGORI</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11.5, letterSpacing: 1, fontWeight: 700 }}>WAKTU</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11.5, letterSpacing: 1, fontWeight: 700 }}>PACE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.data.map((row, i) => (
                                        <tr key={row.code} style={{ borderBottom: '1px solid #f1e8d4', background: i % 2 ? '#FFFAF0' : '#fff' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 900 }}>
                                                {MEDALS[row.overall_rank] ?? <span className="f-display" style={{ fontSize: 15 }}>{row.overall_rank}</span>}
                                                <span style={{ fontSize: 11, color: '#999', marginLeft: 6, fontWeight: 600 }}>
                                                    #{row.category_rank} {row.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontWeight: 800, color: '#141414' }}>{row.name}</div>
                                                <div style={{ fontSize: 11.5, color: '#999', fontFamily: 'monospace' }}>
                                                    {row.race_number ?? row.code}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#666' }}>{row.category}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#C6242D' }}>
                                                {row.finish_time}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: '#666' }}>{row.pace}</td>
                                        </tr>
                                    ))}
                                    {results.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#999' }}>
                                                Belum ada hasil yang tercatat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {results.links.length > 3 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
                                {results.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                        style={{
                                            background: link.active ? '#C6242D' : 'transparent',
                                            border: link.active ? '1px solid #C6242D' : '1px solid #ddd',
                                            borderRadius: 8, padding: '7px 12px', fontSize: 12.5, fontWeight: 700,
                                            color: link.active ? '#FFF6E5' : '#666', cursor: link.url ? 'pointer' : 'not-allowed',
                                            opacity: link.url ? 1 : 0.5,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                        <a href={home().url} style={{ color: '#C6242D', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
                            ← Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
            <style>{'.f-display { font-family: "Anton", sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }'}</style>
        </>
    );
}