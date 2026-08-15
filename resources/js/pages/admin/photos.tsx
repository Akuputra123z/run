import { Head, router, useForm } from '@inertiajs/react';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Images, Search, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { bibs, destroy, index, store } from '@/routes/admin/photos';

type Photo = {
    id: number;
    url: string;
    thumb_url: string;
    bib: string | null;
    photographer: string | null;
    registration: { code: string; name: string; race_number: string } | null;
    created_at: string;
};

type BibSuggestion = {
    race_number: string;
    code: string;
    name: string;
};

type Props = {
    photos: {
        data: Photo[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    search: string;
};

export default function AdminPhotos({ photos, search }: Props) {
    const form = useForm<{ bib: string; photographer: string; photos: File[] }>({
        bib: '',
        photographer: '',
        photos: [],
    });
    const filters = useForm({ search });
    const [matched, setMatched] = useState<BibSuggestion | null>(null);
    const [selected, setSelected] = useState<Photo | null>(null);
    const bibLookup = useRef<Record<string, BibSuggestion>>({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('bib', 'photographer', 'photos');
                setMatched(null);
            },
        });
    };

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index().url, { search: filters.data.search || undefined }, { preserveState: true, replace: true });
    };

    const loadBibOptions = async (q: string): Promise<ComboboxOption[]> => {
        const res = await fetch(bibs({ query: { q } }).url, { headers: { Accept: 'application/json' } });
        const data = (await res.json()) as BibSuggestion[];

        data.forEach((item) => {
            bibLookup.current[item.race_number] = item;
        });

        return data.map((item) => ({
            value: item.race_number,
            label: item.race_number,
            sublabel: `${item.name} · ${item.code}`,
        }));
    };

    const selectBib = (option: ComboboxOption) => {
        form.setData('bib', option.value);
        setMatched(bibLookup.current[option.value] ?? null);
    };

    const canSubmit = form.data.photos.length > 0 && matched !== null;

    const remove = (photo: Photo) => {
        if (!window.confirm(`Hapus foto BIB ${photo.bib ?? '-'}? Foto akan terhapus permanen.`)) {
            return;
        }

        router.delete(destroy(photo.id).url, {
            preserveScroll: true,
            onSuccess: () => setSelected(null),
        });
    };

    const goTo = (direction: 1 | -1) => {
        if (!selected) {
            return;
        }

        const current = photos.data.findIndex((photo) => photo.id === selected.id);
        const next = photos.data[(current + direction + photos.data.length) % photos.data.length];
        setSelected(next);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!selected) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                goTo(-1);
            }

            if (e.key === 'ArrowRight') {
                goTo(1);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    });

    return (
        <>
            <Head title="Foto Race" />

            <div className="flex flex-col gap-6">
                <Card className="lg:max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Camera className="size-4" />
                            Upload Foto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="bib">BIB / Nomor Dada</Label>
                                <div className="mt-1.5">
                                    <Combobox
                                        value={form.data.bib}
                                        placeholder="Pilih BIB…"
                                        emptyMessage="BIB tidak ditemukan — periksa daftar peserta."
                                        loadOptions={loadBibOptions}
                                        onSelect={selectBib}
                                        invalid={Boolean(form.errors.bib)}
                                    />
                                </div>
                                {matched ? (
                                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                        <CheckCircle2 className="size-3.5" />
                                        Terhubung ke {matched.name} ({matched.code})
                                    </p>
                                ) : null}
                                {form.errors.bib && <div className="mt-1 text-xs text-red-600">{form.errors.bib}</div>}
                            </div>
                            <div>
                                <Label htmlFor="photographer">Fotografer (opsional)</Label>
                                <Input
                                    id="photographer"
                                    value={form.data.photographer}
                                    onChange={(e) => form.setData('photographer', e.target.value)}
                                    placeholder="Studio Lens"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="photos">Foto (maks 10, jpg/png/webp, 5MB per file)</Label>
                                <Input
                                    id="photos"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="mt-1.5"
                                    onChange={(e) => form.setData('photos', Array.from(e.target.files ?? []))}
                                />
                                {form.errors.photos && <div className="mt-1 text-xs text-red-600">{form.errors.photos}</div>}
                            </div>
                            <Button
                                type="submit"
                                disabled={form.processing || !canSubmit}
                                className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]"
                            >
                                <Upload className="size-4" />
                                Upload {form.data.photos.length > 0 ? `${form.data.photos.length} Foto` : ''}
                            </Button>
                            <p className="text-xs text-neutral-500">
                                Klik field BIB lalu pilih dari daftar (bisa dicari berdasarkan BIB, nama, atau kode). Foto otomatis muncul di halaman cek-status peserta.
                            </p>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Images className="size-4" />
                            Galeri Foto ({photos.data.length})
                        </CardTitle>
                        <form onSubmit={applyFilter} className="flex items-center gap-2">
                            <Input
                                value={filters.data.search}
                                onChange={(e) => filters.setData('search', e.target.value)}
                                placeholder="Cari BIB / kode / nama…"
                                className="w-56"
                            />
                            <Button type="submit" variant="outline" size="icon" disabled={filters.processing}>
                                <Search className="size-4" />
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        {photos.data.length === 0 ? (
                            <div className="py-12 text-center text-sm text-neutral-500">
                                {search ? 'Tidak ada foto yang cocok dengan pencarian.' : 'Belum ada foto diunggah.'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                {photos.data.map((photo) => (
                                    <figure
                                        key={photo.id}
                                        className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
                                    >
                                        <button type="button" onClick={() => setSelected(photo)} className="block w-full">
                                            <img
                                                src={photo.thumb_url}
                                                alt={`Foto BIB ${photo.bib ?? ''}`}
                                                loading="lazy"
                                                decoding="async"
                                                width={480}
                                                height={480}
                                                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(photo)}
                                            aria-label={`Hapus foto BIB ${photo.bib ?? ''}`}
                                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-red-600"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-xs font-bold">{photo.bib ?? '-'}</span>
                                                <span className="text-[10px] text-white/70">{photo.created_at}</span>
                                            </div>
                                            <div className="truncate text-xs">
                                                {photo.registration ? photo.registration.name : 'BIB belum terhubung'}
                                            </div>
                                            {photo.photographer && (
                                                <div className="truncate text-[10px] text-white/70">📷 {photo.photographer}</div>
                                            )}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        )}
                        {photos.links.length > 3 && (
                            <div className="mt-4 flex justify-end gap-1.5">
                                {photos.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url!)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {selected && (
                <Dialog open onOpenChange={(open) => !open && setSelected(null)}>
                    <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-4xl">
                        <DialogTitle className="sr-only">Foto BIB {selected.bib ?? ''}</DialogTitle>
                        <div className="relative bg-black">
                            <img
                                src={selected.url}
                                alt={`Foto BIB ${selected.bib ?? ''}`}
                                className="max-h-[75vh] w-full object-contain"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => goTo(-1)}
                                    className="ml-2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
                                >
                                    <ChevronLeft className="size-5" />
                                </Button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => goTo(1)}
                                    className="mr-2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
                                >
                                    <ChevronRight className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-sm font-bold">{selected.bib ?? '-'}</span>
                                    <span className="text-xs text-neutral-500">{selected.created_at}</span>
                                </div>
                                <p className="truncate text-sm text-neutral-600">
                                    {selected.registration
                                        ? `${selected.registration.name} (${selected.registration.code})`
                                        : 'BIB belum terhubung'}
                                </p>
                                {selected.photographer && (
                                    <p className="truncate text-xs text-neutral-400">📷 {selected.photographer}</p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={selected.url} target="_blank" rel="noreferrer">
                                        <ExternalLink className="size-3.5" />
                                        Buka Asli
                                    </a>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => remove(selected)}>
                                    <Trash2 className="size-3.5" />
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

AdminPhotos.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Foto Race',
            href: index().url,
        },
    ],
};