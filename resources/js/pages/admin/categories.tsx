import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/admin/categories';

type CategoryRow = {
    id: number;
    name: string;
    distance: string;
    price: number;
    quota: number;
    active_count: number;
};

type Props = {
    categories: CategoryRow[];
};

type FormData = {
    name: string;
    distance: string;
    price: string;
    quota: string;
};

const emptyForm: FormData = { name: '', distance: '', price: '', quota: '' };

export default function AdminCategories({ categories }: Props) {
    const [editing, setEditing] = useState<CategoryRow | null>(null);
    const form = useForm<FormData>(editing ? toForm(editing) : emptyForm);

    const startEdit = (category: CategoryRow) => {
        setEditing(category);
        form.setData(toForm(category));
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

    const remove = (category: CategoryRow) => {
        if (!window.confirm(`Hapus kategori ${category.distance}?`)) {
            return;
        }

        router.delete(destroy(category.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Kategori" />

            <div className="flex flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Daftar Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Kategori</th>
                                        <th className="pb-2 pr-4">Jarak</th>
                                        <th className="pb-2 pr-4">Harga</th>
                                        <th className="pb-2 pr-4">Kuota</th>
                                        <th className="pb-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4 font-semibold">{category.name}</td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary">{category.distance}</Badge>
                                            </td>
                                            <td className="py-3 pr-4 font-mono">Rp {category.price.toLocaleString('id-ID')}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="size-3.5 text-neutral-400" />
                                                    {category.active_count} / {category.quota}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => startEdit(category)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Hapus"
                                                        disabled={category.active_count > 0}
                                                        onClick={() => remove(category)}
                                                    >
                                                        <Trash2 className="size-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                                                Belum ada kategori.
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
                                {editing ? `Edit ${editing.distance}` : 'Tambah Kategori'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-3">
                                <div>
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Fun Run"
                                        className="mt-1.5"
                                    />
                                    {form.errors.name && <div className="mt-1 text-xs text-red-600">{form.errors.name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="distance">Jarak</Label>
                                    <Input
                                        id="distance"
                                        value={form.data.distance}
                                        onChange={(e) => form.setData('distance', e.target.value)}
                                        placeholder="5K"
                                        className="mt-1.5"
                                    />
                                    {form.errors.distance && <div className="mt-1 text-xs text-red-600">{form.errors.distance}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="price">Harga (Rp)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={form.data.price}
                                        onChange={(e) => form.setData('price', e.target.value)}
                                        placeholder="150000"
                                        className="mt-1.5"
                                    />
                                    {form.errors.price && <div className="mt-1 text-xs text-red-600">{form.errors.price}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="quota">Kuota</Label>
                                    <Input
                                        id="quota"
                                        type="number"
                                        value={form.data.quota}
                                        onChange={(e) => form.setData('quota', e.target.value)}
                                        placeholder="500"
                                        className="mt-1.5"
                                    />
                                    {form.errors.quota && <div className="mt-1 text-xs text-red-600">{form.errors.quota}</div>}
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

function toForm(category: CategoryRow): FormData {
    return {
        name: category.name,
        distance: category.distance,
        price: String(category.price),
        quota: String(category.quota),
    };
}

AdminCategories.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Kategori',
            href: index().url,
        },
    ],
};