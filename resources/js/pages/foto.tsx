import { Head, useForm } from '@inertiajs/react';
import { Camera, Download, Search, SearchX } from 'lucide-react';
import { useState } from 'react';
import { home } from '@/routes';
import { lookup } from '@/routes/photos';

type Photo = {
    id: number;
    url: string;
    thumb_url: string;
    photographer: string | null;
};

type Props = {
    bib: string | null;
    photos: Photo[];
};

const BATCH = 8;

export default function Foto({ bib, photos }: Props) {
    const { data, setData, get, processing } = useForm({ bib: bib ?? '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        get(lookup(data.bib.trim()).url, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Cek Foto BIB" />
            <div className="min-h-screen" style={{ background: '#FFF6E5' }}>
                <div style={{ background: 'linear-gradient(160deg, #8B1620 0%, #C6242D 55%, #A31E27 100%)', padding: '44px 20px 56px' }}>
                    <div className="mx-auto max-w-5xl">
                        <a href={home().url} className="f-display" style={{ fontSize: 13, letterSpacing: 2, color: 'rgba(255,246,229,0.7)' }}>
                            ← CV WIYATA AMERTA BUSINESS RUN 2026
                        </a>
                        <div className="f-display" style={{ fontSize: 'clamp(34px, 6vw, 54px)', color: '#FFC93C', lineHeight: 1, marginTop: 10 }}>
                            Cek Foto BIB
                        </div>
                        <div style={{ fontSize: 14, color: 'rgba(255,246,229,0.85)', marginTop: 8 }}>
                            Pantai Karang Jahe · Rembang · 15 November 2026
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl" style={{ marginTop: -28, padding: '0 20px 60px' }}>
                    <div style={{ background: '#141414', borderRadius: 16, padding: 16, boxShadow: '0 18px 40px rgba(0,0,0,0.18)' }}>
                        <form onSubmit={submit} style={{ display: 'flex', gap: 10 }}>
                            <input
                                value={data.bib}
                                onChange={(e) => setData('bib', e.target.value.toUpperCase())}
                                placeholder="Masukkan BIB atau kode pendaftaran… (contoh: KBR-5K-0002)"
                                style={{
                                    flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: 10, padding: '11px 14px', color: '#FFF6E5', fontSize: 13.5, outline: 'none',
                                    letterSpacing: 1, fontFamily: 'monospace', textTransform: 'uppercase',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.bib.trim()}
                                style={{
                                    background: '#C6242D', border: 'none', borderRadius: 10, padding: '0 18px',
                                    color: '#FFF6E5', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                                    opacity: processing || !data.bib.trim() ? 0.6 : 1,
                                }}
                            >
                                <Search size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                                Cari
                            </button>
                        </form>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,246,229,0.55)', marginTop: 10, fontWeight: 600 }}>
                            Masukkan nomor BIB (di kaos/race pack kamu) atau kode pendaftaran. Foto yang ditemukan bisa diunduh gratis.
                        </div>
                    </div>

                    {bib && photos.length === 0 && (
                        <div style={{ background: '#fff', borderRadius: 16, marginTop: 18, padding: '56px 24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(20,20,20,0.08)' }}>
                            <SearchX size={36} color="#C6242D" style={{ margin: '0 auto 14px' }} />
                            <div className="f-display" style={{ fontSize: 20, color: '#141414' }}>Belum Ada Foto untuk {bib}</div>
                            <div style={{ fontSize: 13, color: '#999', marginTop: 8, fontWeight: 600 }}>
                                Foto akan muncul di sini setelah diunggah oleh fotografer. Pastikan BIB atau kode pendaftaranmu benar, lalu coba lagi nanti.
                            </div>
                        </div>
                    )}

                    {photos.length > 0 && <Gallery bib={bib ?? ''} photos={photos} />}

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

function Gallery({ bib, photos }: { bib: string; photos: Photo[] }) {
    const [visible, setVisible] = useState(BATCH);

    return (
        <div style={{ background: '#fff', borderRadius: 16, marginTop: 18, padding: 20, boxShadow: '0 10px 30px rgba(20,20,20,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Camera size={18} color="#C6242D" />
                <div className="f-display" style={{ fontSize: 16, color: '#141414' }}>
                    Foto BIB {bib} <span style={{ color: '#C6242D' }}>({photos.length})</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {photos.slice(0, visible).map((photo) => (
                    <div key={photo.id} style={{ background: '#FAF3E3', borderRadius: 12, padding: 8 }}>
                        <a href={photo.url} target="_blank" rel="noreferrer" title="Lihat foto ukuran penuh" style={{ display: 'block' }}>
                            <img
                                src={photo.thumb_url}
                                alt={`Foto race BIB ${bib}`}
                                loading="lazy"
                                decoding="async"
                                width={480}
                                height={480}
                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                            />
                        </a>
                        {photo.photographer && (
                            <div style={{ fontSize: 10.5, color: '#999', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
                                📷 {photo.photographer}
                            </div>
                        )}
                        <a
                            href={photo.url}
                            download
                            title="Unduh foto"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                marginTop: 8, padding: '8px 10px', borderRadius: 8,
                                background: '#C6242D', color: '#FFF6E5', textDecoration: 'none',
                                fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer',
                            }}
                        >
                            <Download size={13} /> Download
                        </a>
                    </div>
                ))}
            </div>

            {visible < photos.length && (
                <button
                    type="button"
                    onClick={() => setVisible((count) => count + BATCH)}
                    style={{
                        marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 12,
                        background: '#141414', color: '#FFC93C', border: 'none', fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
                    }}
                >
                    Muat Lebih ({photos.length - visible} foto lagi)
                </button>
            )}
        </div>
    );
}