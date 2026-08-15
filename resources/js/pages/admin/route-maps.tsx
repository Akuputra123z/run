import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/admin/route-maps';

type RouteMapRow = {
    id: number;
    title: string;
    description: string | null;
    photo_url: string | null;
    sort_order: number;
};

type Props = {
    routeMaps: RouteMapRow[];
};

type FormData = {
    title: string;
    sort_order: string;
    photo: File | null;
    detail_photo: File | null;
};

const emptyForm: FormData = { title: '', sort_order: '0', photo: null, detail_photo: null };

export default function AdminRouteMaps({ routeMaps }: Props) {
    const [editing, setEditing] = useState<RouteMapRow | null>(null);
    const form = useForm<FormData>(emptyForm);

    const startEdit = (routeMap: RouteMapRow) => {
        setEditing(routeMap);
        form.setData({
            title: routeMap.title,
            sort_order: String(routeMap.sort_order),
            photo: null,
            detail_photo: null,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            form.put(update(editing.id).url, { preserveScroll: true, onSuccess: () => reset() });
        } else {
            form.post(store().url, { preserveScroll: true, onSuccess: () => reset() });
        }
    };

    const reset = () => {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
    };

    const remove = (routeMap: RouteMapRow) => {
        if (!window.confirm(`Hapus rute ${routeMap.title}?`)) {
            return;
        }

        router.delete(destroy(routeMap.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Rute" />

            <div className="flex flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Daftar Rute</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Rute</th>
                                        <th className="pb-2 pr-4">Foto</th>
                                        <th className="pb-2 pr-4">Urutan</th>
                                        <th className="pb-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routeMaps.map((routeMap) => (
                                        <tr key={routeMap.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4">
                                                <span className="font-semibold">{routeMap.title}</span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {routeMap.photo_url ? (
                                                    <img
                                                        src={routeMap.photo_url}
                                                        alt={routeMap.title}
                                                        className="h-10 w-16 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-neutral-500">Belum ada foto</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-neutral-500">{routeMap.sort_order}</td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => startEdit(routeMap)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Hapus" onClick={() => remove(routeMap)}>
                                                        <Trash2 className="size-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {routeMaps.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                                                Belum ada rute.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Plus className="size-4" />
                                {editing ? `Edit ${editing.title}` : 'Tambah Rute'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-3">
                                <div>
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="10 KM"
                                        className="mt-1.5"
                                    />
                                    {form.errors.title && <div className="mt-1 text-xs text-red-600">{form.errors.title}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="photo" className="flex items-center gap-1.5">
                                        <Upload className="size-3.5" />
                                        Foto peta rute (jpg/png/webp, maks 5MB)
                                    </Label>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => form.setData('photo', e.target.files?.[0] ?? null)}
                                        className="mt-1.5"
                                    />
                                    {form.errors.photo && <div className="mt-1 text-xs text-red-600">{form.errors.photo}</div>}
                                    {editing && !form.data.photo && (
                                        <div className="mt-1 text-xs text-neutral-500">Biarkan kosong untuk mempertahankan foto saat ini.</div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="detail_photo" className="flex items-center gap-1.5">
                                        <Upload className="size-3.5" />
                                        Foto detail (popup rute, jpg/png/webp, maks 5MB)
                                    </Label>
                                    <Input
                                        id="detail_photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => form.setData('detail_photo', e.target.files?.[0] ?? null)}
                                        className="mt-1.5"
                                    />
                                    {form.errors.detail_photo && (
                                        <div className="mt-1 text-xs text-red-600">{form.errors.detail_photo}</div>
                                    )}
                                    {editing && !form.data.detail_photo && (
                                        <div className="mt-1 text-xs text-neutral-500">Biarkan kosong untuk mempertahankan foto detail saat ini.</div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="sort_order">Urutan</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', e.target.value)}
                                        className="mt-1.5"
                                    />
                                    {form.errors.sort_order && <div className="mt-1 text-xs text-red-600">{form.errors.sort_order}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={form.processing} className="flex-1 bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                                        {editing ? 'Simpan' : 'Tambah'}
                                    </Button>
                                    {editing && (
                                        <Button type="button" variant="outline" onClick={reset}>
                                            Batal
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminRouteMaps.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Rute',
            href: index().url,
        },
    ],
};