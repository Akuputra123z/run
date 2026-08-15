import { Head, router, useForm } from '@inertiajs/react';
import { GripVertical, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/admin/gallery';

type GalleryItem = {
    id: number;
    url: string;
    thumb_url: string;
    label: string | null;
    sort_order: number;
};

type Props = {
    items: GalleryItem[];
};

export default function AdminGallery({ items }: Props) {
    const form = useForm<{ photo: File | null; label: string }>({ photo: null, label: '' });
    const [editing, setEditing] = useState<GalleryItem | null>(null);
    const editForm = useForm<{ label: string; sort_order: string }>({ label: '', sort_order: '0' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
            },
        });
    };

    const startEdit = (item: GalleryItem) => {
        setEditing(item);
        editForm.setData({
            label: item.label ?? '',
            sort_order: String(item.sort_order),
        });
    };

    const saveEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editing) {
            return;
        }

        editForm.put(update(editing.id).url, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const remove = (item: GalleryItem) => {
        if (!window.confirm(`Hapus foto galeri "${item.label ?? '-'}"? Foto akan terhapus permanen.`)) {
            return;
        }

        router.delete(destroy(item.id).url, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    return (
        <>
            <Head title="Galeri Event" />

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <ImagePlus className="size-4" />
                            Unggah Foto Galeri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="label">Label</Label>
                                    <Input
                                        id="label"
                                        value={form.data.label}
                                        onChange={(e) => form.setData('label', e.target.value)}
                                        placeholder="START LINE"
                                        className="mt-1.5"
                                    />
                                    {form.errors.label && <div className="mt-1 text-xs text-red-600">{form.errors.label}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="photo">Foto (jpg/png/webp, maks 5MB)</Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => form.setData('photo', e.target.files?.[0] ?? null)}
                                        className="mt-1.5"
                                    />
                                    {form.errors.photo && <div className="mt-1 text-xs text-red-600">{form.errors.photo}</div>}
                                </div>
                            </div>
                            <div>
                                <Button type="submit" disabled={form.processing || !form.data.photo} className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                                    <Upload className="size-4" />
                                    Unggah
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Foto Galeri ({items.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="py-8 text-center text-sm text-neutral-500">Belum ada foto galeri.</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex flex-col gap-2">
                                        <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            <img
                                                src={item.thumb_url}
                                                alt={item.label ?? 'Foto galeri'}
                                                loading="lazy"
                                                className="aspect-[4/3] w-full object-cover"
                                            />
                                            <div className="absolute right-2 top-2 flex gap-1">
                                                <Button variant="secondary" size="icon" className="size-7" title="Edit" onClick={() => startEdit(item)}>
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="size-7 bg-red-600 hover:bg-red-700 text-white"
                                                    title="Hapus"
                                                    onClick={() => remove(item)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        {editing?.id === item.id ? (
                                            <form onSubmit={saveEdit} className="flex items-center gap-2">
                                                <Input
                                                    value={editForm.data.label}
                                                    onChange={(e) => editForm.setData('label', e.target.value)}
                                                    placeholder="Label"
                                                    className="h-8 text-xs"
                                                />
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={editForm.data.sort_order}
                                                    onChange={(e) => editForm.setData('sort_order', e.target.value)}
                                                    className="h-8 w-16 text-xs"
                                                    title="Urutan"
                                                />
                                                <Button type="submit" size="sm" disabled={editForm.processing} className="h-8">
                                                    Simpan
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="flex items-center gap-2 px-1">
                                                <GripVertical className="size-3.5 text-neutral-400" />
                                                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label ?? 'Tanpa label'}</span>
                                                <span className="font-mono text-xs text-neutral-500">#{item.sort_order}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminGallery.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Galeri Event',
            href: index().url,
        },
    ],
};