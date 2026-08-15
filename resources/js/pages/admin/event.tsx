import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, Gift, Landmark, Plus, Save, Timer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index, update } from '@/routes/admin/events';

type Settings = {
    event_name: string;
    event_date: string | null;
    event_location: string | null;
    bank: string;
    account_number: string;
    account_name: string;
    payment_hours: string;
    race_pack_dates: string[];
    race_pack_location: string | null;
    start_date: string | null;
    start_times: { distance: string; time: string }[];
    doorprize_badge: string | null;
    doorprize_event_name: string | null;
    doorprize_title: string | null;
};

type Props = {
    settings: Settings;
};

type FormData = {
    event_name: string;
    event_date: string;
    event_location: string;
    bank: string;
    account_number: string;
    account_name: string;
    payment_hours: string;
    race_pack_dates: string[];
    race_pack_location: string;
    start_date: string;
    start_times: { distance: string; time: string }[];
    doorprize_badge: string;
    doorprize_event_name: string;
    doorprize_title: string;
};

export default function AdminEvent({ settings }: Props) {
    const form = useForm<FormData>({
        event_name: settings.event_name,
        event_date: settings.event_date ?? '',
        event_location: settings.event_location ?? '',
        bank: settings.bank,
        account_number: settings.account_number,
        account_name: settings.account_name,
        payment_hours: settings.payment_hours,
        race_pack_dates: settings.race_pack_dates,
        race_pack_location: settings.race_pack_location ?? '',
        start_date: settings.start_date ?? '',
        start_times: settings.start_times,
        doorprize_badge: settings.doorprize_badge ?? '',
        doorprize_event_name: settings.doorprize_event_name ?? '',
        doorprize_title: settings.doorprize_title ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(update().url, { preserveScroll: true });
    };

    const addRacePackDate = () => form.setData('race_pack_dates', [...form.data.race_pack_dates, '']);

    const changeRacePackDate = (index: number, value: string) => {
        const dates = [...form.data.race_pack_dates];
        dates[index] = value;
        form.setData('race_pack_dates', dates);
    };

    const removeRacePackDate = (index: number) => {
        form.setData('race_pack_dates', form.data.race_pack_dates.filter((_, i) => i !== index));
    };

    const addStartTime = () => form.setData('start_times', [...form.data.start_times, { distance: '', time: '' }]);

    const changeStartTime = (index: number, key: 'distance' | 'time', value: string) => {
        const times = form.data.start_times.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry));
        form.setData('start_times', times);
    };

    const removeStartTime = (index: number) => {
        form.setData('start_times', form.data.start_times.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title="Manajemen Event" />

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <CalendarDays className="size-4" />
                            Informasi Event
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="event_name">Nama Event</Label>
                                    <Input
                                        id="event_name"
                                        value={form.data.event_name}
                                        onChange={(e) => form.setData('event_name', e.target.value)}
                                        className="mt-1.5"
                                    />
                                    {form.errors.event_name && <div className="mt-1 text-xs text-red-600">{form.errors.event_name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="event_date">Tanggal Event</Label>
                                    <Input
                                        id="event_date"
                                        value={form.data.event_date}
                                        onChange={(e) => form.setData('event_date', e.target.value)}
                                        placeholder="14 Agustus 2026"
                                        className="mt-1.5"
                                    />
                                    {form.errors.event_date && <div className="mt-1 text-xs text-red-600">{form.errors.event_date}</div>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="event_location">Lokasi</Label>
                                <Input
                                    id="event_location"
                                    value={form.data.event_location}
                                    onChange={(e) => form.setData('event_location', e.target.value)}
                                    placeholder="Pantai Ancol, Jakarta Utara"
                                    className="mt-1.5"
                                />
                                {form.errors.event_location && <div className="mt-1 text-xs text-red-600">{form.errors.event_location}</div>}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Timer className="size-4" />
                            Jadwal Acara
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div>
                                <Label>Tanggal Pengambilan Race Pack</Label>
                                <div className="mt-1.5 flex flex-col gap-2">
                                    {form.data.race_pack_dates.map((date, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={date}
                                                onChange={(e) => changeRacePackDate(index, e.target.value)}
                                                placeholder="13 November 2026"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="Hapus tanggal"
                                                onClick={() => removeRacePackDate(index)}
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addRacePackDate} className="w-fit">
                                        <Plus className="size-4" />
                                        Tambah Tanggal
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="race_pack_location">Lokasi Pengambilan Race Pack</Label>
                                <Input
                                    id="race_pack_location"
                                    value={form.data.race_pack_location}
                                    onChange={(e) => form.setData('race_pack_location', e.target.value)}
                                    placeholder="Pendopo Kabupaten Rembang"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="start_date">Tanggal Start</Label>
                                <Input
                                    id="start_date"
                                    value={form.data.start_date}
                                    onChange={(e) => form.setData('start_date', e.target.value)}
                                    placeholder="15 November 2026"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Waktu Start per Kategori</Label>
                                <div className="mt-1.5 flex flex-col gap-2">
                                    {form.data.start_times.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={entry.distance}
                                                onChange={(e) => changeStartTime(index, 'distance', e.target.value)}
                                                placeholder="21K"
                                                className="w-28"
                                            />
                                            <Input
                                                value={entry.time}
                                                onChange={(e) => changeStartTime(index, 'time', e.target.value)}
                                                placeholder="05.00 WIB"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                title="Hapus waktu start"
                                                onClick={() => removeStartTime(index)}
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addStartTime} className="w-fit">
                                        <Plus className="size-4" />
                                        Tambah Waktu Start
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Gift className="size-4" />
                            Doorprize
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="doorprize_badge">Badge</Label>
                                <Input
                                    id="doorprize_badge"
                                    value={form.data.doorprize_badge}
                                    onChange={(e) => form.setData('doorprize_badge', e.target.value)}
                                    placeholder="FINISH HAPPY, HADIAH MENANTI"
                                    className="mt-1.5"
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="doorprize_event_name">Nama Event</Label>
                                    <Input
                                        id="doorprize_event_name"
                                        value={form.data.doorprize_event_name}
                                        onChange={(e) => form.setData('doorprize_event_name', e.target.value)}
                                        placeholder="REMBANG CV WIYATA AMERTA BUSINESS RUN 2026"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="doorprize_title">Judul</Label>
                                    <Input
                                        id="doorprize_title"
                                        value={form.data.doorprize_title}
                                        onChange={(e) => form.setData('doorprize_title', e.target.value)}
                                        placeholder="DOORPRIZE"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Landmark className="size-4" />
                            Rekening Panitia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="bank">Bank</Label>
                                    <Input
                                        id="bank"
                                        value={form.data.bank}
                                        onChange={(e) => form.setData('bank', e.target.value)}
                                        placeholder="BCA"
                                        className="mt-1.5"
                                    />
                                    {form.errors.bank && <div className="mt-1 text-xs text-red-600">{form.errors.bank}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="account_number">No. Rekening</Label>
                                    <Input
                                        id="account_number"
                                        value={form.data.account_number}
                                        onChange={(e) => form.setData('account_number', e.target.value)}
                                        placeholder="1234567890"
                                        className="mt-1.5"
                                    />
                                    {form.errors.account_number && <div className="mt-1 text-xs text-red-600">{form.errors.account_number}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="account_name">Atas Nama</Label>
                                    <Input
                                        id="account_name"
                                        value={form.data.account_name}
                                        onChange={(e) => form.setData('account_name', e.target.value)}
                                        placeholder="Panitia CV WIYATA AMERTA Business Run 2026"
                                        className="mt-1.5"
                                    />
                                    {form.errors.account_name && <div className="mt-1 text-xs text-red-600">{form.errors.account_name}</div>}
                                </div>
                            </div>
                            <div className="max-w-xs">
                                <Label htmlFor="payment_hours" className="flex items-center gap-1.5">
                                    <Timer className="size-3.5" />
                                    Batas Pembayaran (jam)
                                </Label>
                                <Input
                                    id="payment_hours"
                                    type="number"
                                    min={1}
                                    max={168}
                                    value={form.data.payment_hours}
                                    onChange={(e) => form.setData('payment_hours', e.target.value)}
                                    className="mt-1.5"
                                />
                                {form.errors.payment_hours && <div className="mt-1 text-xs text-red-600">{form.errors.payment_hours}</div>}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={submit} disabled={form.processing} className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                        <Save className="size-4" />
                        Simpan Pengaturan
                    </Button>
                </div>
            </div>
        </>
    );
}

AdminEvent.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Manajemen Event',
            href: index().url,
        },
    ],
};