import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/admin/guest-stars';

type GuestStarRow = {
    id: number;
    name: string;
    role: string;
    color: string;
    photo_url: string | null;
    sort_order: number;
};

type Props = {
    guestStars: GuestStarRow[];
};

type FormData = {
    name: string;
    role: string;
    photo: File | null;
};

const emptyForm: FormData = { name: '', role: '', photo: null };

const initials = (name: string) =>
    name
        .split(' ')
        .map((word) => word[0])
        .join('');

export default function AdminGuestStars({ guestStars }: Props) {
    const [editing, setEditing] = useState<GuestStarRow | null>(null);
    const form = useForm<FormData>(emptyForm);

    const startEdit = (guestStar: GuestStarRow) => {
        setEditing(guestStar);
        form.setData({ name: guestStar.name, role: guestStar.role, photo: null });
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

    const remove = (guestStar: GuestStarRow) => {
        if (!window.confirm(`Hapus guest star ${guestStar.name}?`)) {
            return;
        }

        router.delete(destroy(guestStar.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Guest Star" />

            <div className="flex flex-col gap-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Daftar Guest Star</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Guest Star</th>
                                        <th className="pb-2 pr-4">Peran</th>
                                        <th className="pb-2 pr-4">Urutan</th>
                                        <th className="pb-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guestStars.map((guestStar) => (
                                        <tr key={guestStar.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold text-white"
                                                        style={{ background: `linear-gradient(160deg, ${guestStar.color}, #141414)` }}
                                                    >
                                                        {guestStar.photo_url ? (
                                                            <img src={guestStar.photo_url} alt={guestStar.name} className="size-full object-cover" />
                                                        ) : (
                                                            initials(guestStar.name)
                                                        )}
                                                    </div>
                                                    <span className="font-semibold">{guestStar.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 whitespace-pre-line text-neutral-500">{guestStar.role}</td>
                                            <td className="py-3 pr-4 font-mono text-neutral-500">{guestStar.sort_order}</td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" title="Edit" onClick={() => startEdit(guestStar)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Hapus" onClick={() => remove(guestStar)}>
                                                        <Trash2 className="size-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {guestStars.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                                                Belum ada guest star.
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
                                {editing ? `Edit ${editing.name}` : 'Tambah Guest Star'}
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
                                        placeholder="BAGAS ADITYA"
                                        className="mt-1.5"
                                    />
                                    {form.errors.name && <div className="mt-1 text-xs text-red-600">{form.errors.name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="role">Peran</Label>
                                    <Input
                                        id="role"
                                        value={form.data.role}
                                        onChange={(e) => form.setData('role', e.target.value)}
                                        placeholder="HOST"
                                        className="mt-1.5"
                                    />
                                    {form.errors.role && <div className="mt-1 text-xs text-red-600">{form.errors.role}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="photo" className="flex items-center gap-1.5">
                                        <Upload className="size-3.5" />
                                        Foto (jpg/png/webp, maks 5MB)
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

AdminGuestStars.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Guest Star',
            href: index().url,
        },
    ],
};