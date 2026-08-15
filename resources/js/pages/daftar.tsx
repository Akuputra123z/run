import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Timer } from 'lucide-react';
import { useState, useRef } from 'react';
import { home } from '@/routes';
import { store } from '@/routes/registration';

type Category = {
    id: number;
    name: string;
    distance: string;
    price: number;
    quota: number;
    slots_left: number;
};

type Props = {
    categories: Category[];
};

type Gender = 'men' | 'women';

const SIZE_SPECS: Record<Gender, string[]> = {
    men: ['S', 'M', 'L', 'XL', 'XXL'],
    women: ['S', 'M', 'L', 'XL', 'XXL'],
};

const STEPS = ['Kategori', 'Data Diri', 'Jersey & Kontak', 'Ringkasan'];

const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

export default function Daftar({ categories }: Props) {
    const [step, setStep] = useState(0);
    const [gender, setGender] = useState<Gender>('men');
    const [agreed, setAgreed] = useState(false);
    const [agreedError, setAgreedError] = useState(false);
    const submittedRef = useRef(false);

    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        email: '',
        phone: '',
        nik: '',
        gender: 'men',
        birth_date: '',
        city: '',
        jersey_size: '',
        emergency_name: '',
        emergency_phone: '',
        community: '',
    });

    const selectedCategory = categories.find((c) => c.id === Number(data.category_id));
    const canNext = (): boolean => {
        if (step === 0) {
            return data.category_id !== '';
        }

        if (step === 1) {
            return (
                data.name.trim() !== '' &&
                data.email.trim() !== '' &&
                data.phone.trim() !== '' &&
                data.birth_date !== '' &&
                data.city.trim() !== '' &&
                (data.nik === '' || data.nik.length === 16)
            );
        }

        if (step === 2) {
            return (
                data.jersey_size !== '' &&
                data.emergency_name.trim() !== '' &&
                data.emergency_phone.trim() !== ''
            );
        }

        return true;
    };

    const next = () => {
        if (step < 3) {
setStep(step + 1);
}
    };

    const back = () => {
        if (step > 0) {
setStep(step - 1);
}
    };

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#141414', color: '#FFF6E5', minHeight: '100vh' }}>
            <Head title="Daftar Sekarang" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
                * { box-sizing: border-box; }
                .f-display { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px; }
                .f-mono { font-family: 'JetBrains Mono', monospace; }
                .inp {
                    width: 100%; background: #1c1c1c; border: 1px solid rgba(255,255,255,0.15);
                    color: #FFF6E5; border-radius: 12px; padding: 13px 16px; font-size: 14px; outline: none;
                    transition: border-color 0.2s;
                }
                .inp:focus { border-color: #FFC93C; }
                .inp::placeholder { color: rgba(255,246,229,0.35); }
                .lbl { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase; opacity: 0.75; }
            `}</style>

            {/* top bar */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href={home()} className="f-display" style={{ color: '#FFF6E5', fontSize: 16, textDecoration: 'none' }}>
                    CV WIYATA AMERTA <span style={{ color: '#FFC93C' }}>BUSINESS RUN</span> 2026
                </Link>
                <div className="f-mono" style={{ fontSize: 11, opacity: 0.6 }}>REGISTRATION</div>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>
                <div className="f-display" style={{ fontSize: 'clamp(30px, 5vw, 44px)', textAlign: 'center', marginBottom: 8 }}>
                    DAFTAR <span style={{ color: '#FFC93C' }}>SEKARANG</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.65, fontWeight: 600, marginBottom: 32 }}>
                    Minggu, 15 November 2026 · Pantai Karang Jahe, Rembang
                </div>

                {/* step indicator */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                    {STEPS.map((label, i) => (
                        <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                            <div
                                style={{
                                    width: 30, height: 30, margin: '0 auto', borderRadius: 999,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: i < step ? '#FFC93C' : i === step ? '#C6242D' : '#1c1c1c',
                                    color: i <= step ? '#141414' : '#FFF6E5', fontWeight: 800, fontSize: 13,
                                    border: i === step ? '2px solid #FFC93C' : 'none',
                                }}
                            >
                                {i < step ? <Check size={15} /> : i + 1}
                            </div>
                            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, marginTop: 6, opacity: i === step ? 1 : 0.5, textTransform: 'uppercase' }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                <form
                    
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (!agreed) {
                            setAgreedError(true);

                            return;
                        }

                        if (processing || submittedRef.current) {
                            return;
                        }

                        submittedRef.current = true;
                        post(store().url, {
                            onError: (errs) => {
                                submittedRef.current = false;

                                if (errs.category_id) {
                                    setStep(0);
                                } else if (errs.name || errs.email || errs.phone || errs.birth_date || errs.city || errs.nik) {
                                    setStep(1);
                                } else if (errs.jersey_size || errs.emergency_name || errs.emergency_phone) {
                                    setStep(2);
                                }
                            },
                            onFinish: () => {
                                submittedRef.current = false;
                            },
                        });
                    }}
                >
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
 setData('category_id', String(c.id)); 
}}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '20px 24px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                                        background: data.category_id === String(c.id) ? '#C6242D' : '#1c1c1c',
                                        border: data.category_id === String(c.id) ? '2px solid #FFC93C' : '1px solid rgba(255,255,255,0.12)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div>
                                        <div className="f-display" style={{ fontSize: 22, color: '#FFF6E5' }}>{c.distance}</div>
                                        <div style={{ fontSize: 12.5, opacity: 0.7, fontWeight: 600, marginTop: 2 }}>
                                            {c.name} · sisa kuota {c.slots_left}/{c.quota}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="f-display" style={{ color: '#FFC93C', fontSize: 17 }}>{formatRupiah(c.price)}</div>
                                        {c.slots_left === 0 && <div style={{ fontSize: 11, color: '#ff8a8a', fontWeight: 800, marginTop: 4 }}>KUOTA PENUH</div>}
                                    </div>
                                </button>
                            ))}
                            {errors.category_id && <div style={{ color: '#ff8a8a', fontSize: 12.5 }}>{errors.category_id}</div>}
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label className="lbl">Nama Lengkap *</label>
                                <input className="inp" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Sesuai KTP" />
                                {errors.name && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.name}</div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="lbl">Email *</label>
                                    <input className="inp" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="nama@email.com" />
                                    {errors.email && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.email}</div>}
                                </div>
                                <div>
                                    <label className="lbl">No. HP/WA *</label>
                                    <input className="inp" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="08xxxxxxxxxx" />
                                    {errors.phone && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.phone}</div>}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="lbl">Jenis Kelamin *</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {(['men', 'women'] as const).map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => {
 setGender(g); setData('gender', g); 
}}
                                                style={{
                                                    flex: 1, padding: '13px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800,
                                                    background: data.gender === g ? '#FFC93C' : '#1c1c1c',
                                                    color: data.gender === g ? '#141414' : '#FFF6E5',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                }}
                                            >
                                                {g === 'men' ? 'PRIA' : 'WANITA'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="lbl">Tanggal Lahir *</label>
                                    <input className="inp" type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} />
                                    {errors.birth_date && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.birth_date}</div>}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="lbl">Asal Kota *</label>
                                    <input className="inp" value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="Rembang" />
                                    {errors.city && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.city}</div>}
                                </div>
                                <div>
                                    <label className="lbl">NIK (opsional, untuk asuransi)</label>
                                    <input className="inp" value={data.nik} onChange={(e) => setData('nik', e.target.value)} placeholder="16 digit" maxLength={16} />
                                    {errors.nik && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.nik}</div>}
                                </div>
                            </div>
                            <div>
                                <label className="lbl">Komunitas / Instansi (opsional)</label>
                                <input className="inp" value={data.community} onChange={(e) => setData('community', e.target.value)} placeholder="Contoh: Runners Rembang" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label className="lbl">Ukuran Jersey ({gender === 'men' ? 'Pria' : 'Wanita'}) *</label>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {SIZE_SPECS[gender].map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setData('jersey_size', size)}
                                            style={{
                                                width: 54, height: 54, borderRadius: 14, cursor: 'pointer',
                                                fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                                                background: data.jersey_size === size ? '#C6242D' : '#1c1c1c',
                                                color: '#FFF6E5',
                                                border: data.jersey_size === size ? '2px solid #FFC93C' : '1px solid rgba(255,255,255,0.15)',
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                                                        onClick={() => {
                                        const newGender = gender === 'men' ? 'women' : 'men';

                                        setGender(newGender);
                                        setData('gender', newGender);
                                        setData('jersey_size', '');
                                    }}
                                    style={{ marginTop: 12, background: 'none', border: 'none', color: '#FFC93C', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Ganti ukuran {gender === 'men' ? 'wanita' : 'pria'}
                                </button>
                                {errors.jersey_size && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.jersey_size}</div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label className="lbl">Kontak Darurat (Nama) *</label>
                                    <input className="inp" value={data.emergency_name} onChange={(e) => setData('emergency_name', e.target.value)} placeholder="Nama keluarga/teman" />
                                    {errors.emergency_name && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.emergency_name}</div>}
                                </div>
                                <div>
                                    <label className="lbl">Kontak Darurat (HP) *</label>
                                    <input className="inp" value={data.emergency_phone} onChange={(e) => setData('emergency_phone', e.target.value)} placeholder="08xxxxxxxxxx" />
                                    {errors.emergency_phone && <div style={{ color: '#ff8a8a', fontSize: 12.5, marginTop: 6 }}>{errors.emergency_phone}</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && selectedCategory && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ background: '#1c1c1c', borderRadius: 16, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
                                    <span style={{ opacity: 0.7 }}>Kategori</span>
                                    <span className="f-display" style={{ fontSize: 15 }}>{selectedCategory.distance} · {selectedCategory.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
                                    <span style={{ opacity: 0.7 }}>Peserta</span>
                                    <span style={{ fontWeight: 700 }}>{data.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
                                    <span style={{ opacity: 0.7 }}>Ukuran Jersey</span>
                                    <span className="f-mono" style={{ fontWeight: 700 }}>{data.jersey_size} ({gender})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
                                    <span style={{ opacity: 0.7 }}>Kontak</span>
                                    <span style={{ fontWeight: 700 }}>{data.email} · {data.phone}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 8, borderTop: '1px dashed rgba(255,255,255,0.2)', fontSize: 14 }}>
                                    <span className="f-display" style={{ fontSize: 16 }}>Total Bayar</span>
                                    <span className="f-display" style={{ color: '#FFC93C', fontSize: 20 }}>{formatRupiah(selectedCategory.price)}</span>
                                </div>
                            </div>
                            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, opacity: 0.75, lineHeight: 1.6 }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => {
                                        setAgreed(e.target.checked);

                                        if (e.target.checked) {
setAgreedError(false);
}
                                    }}
                                    style={{ width: 16, height: 16, marginTop: 2, accentColor: '#C6242D' }}
                                />
                                <span>
                                    Saya menyetujui syarat & ketentuan dan memberikan persetujuan pengelolaan data pribadi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi untuk keperluan penyelenggaraan event.
                                </span>
                            </label>
                            {agreedError && (
                                <div style={{ color: '#ff8a8a', fontSize: 12.5, fontWeight: 700 }}>
                                    Centang persetujuan syarat & ketentuan sebelum submit.
                                </div>
                            )}
                            {Object.keys(errors).length > 0 && (
                                <div style={{ background: 'rgba(198, 36, 45, 0.15)', border: '1px solid #C6242D', borderRadius: 14, padding: '14px 18px', color: '#ff8a8a', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontWeight: 800 }}>Pendaftaran Gagal:</div>
                                    {Object.entries(errors).map(([key, msg]) => (
                                        <div key={key}>• {msg}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* nav buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, gap: 12 }}>
                        {step > 0 ? (
                            <button
                                type="button"
                                onClick={back}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 999,
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF6E5',
                                    fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                <ArrowLeft size={16} /> Kembali
                            </button>
                        ) : (
                            <span />
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={next}
                                disabled={!canNext()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 999,
                                    background: canNext() ? '#C6242D' : '#333', border: 'none', color: '#FFF6E5',
                                    fontSize: 13.5, fontWeight: 800, cursor: canNext() ? 'pointer' : 'not-allowed',
                                }}
                            >
                                Lanjut <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 999,
                                    background: '#FFC93C', border: 'none', color: '#141414',
                                    fontSize: 13.5, fontWeight: 800, cursor: 'pointer', opacity: processing ? 0.6 : 1,
                                }}
                            >
                                {processing ? 'Memproses...' : 'SUBMIT PENDAFTARAN'} <Check size={16} />
                            </button>
                        )}
                    </div>
                </form>

                <div style={{ marginTop: 40, padding: '18px 22px', borderRadius: 14, background: 'rgba(255,201,60,0.08)', border: '1px solid rgba(255,201,60,0.3)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <Timer size={18} color="#FFC93C" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 12.5, lineHeight: 1.7, opacity: 0.8 }}>
                        Setelah submit, kamu mendapat <b>kode pendaftaran</b> dan harus transfer ke rekening panitia <b>maksimal 24 jam</b>. Setelah itu unggah bukti transfer untuk diverifikasi panitia. Race pack diambil di lokasi sebelum race day.
                    </div>
                </div>
            </div>
        </div>
    );
}