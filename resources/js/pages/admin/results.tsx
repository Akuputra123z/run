import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Medal, Timer, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as resultsIndex } from '@/routes/admin/results';
import { index as timingIndex } from '@/routes/admin/timing';
import { publicMethod } from '@/routes/results';

type ResultRow = {
    id: number;
    code: string;
    name: string;
    category: string;
    race_number: string | null;
    finish_time: string;
    rank: number;
};

type CategoryResult = {
    id: number;
    name: string;
    distance: string;
    finishers: ResultRow[];
};

type Props = {
    overall: ResultRow[];
    perCategory: CategoryResult[];
    finisher_count: number;
};

export default function AdminResults({ overall, perCategory, finisher_count }: Props) {
    return (
        <>
            <Head title="Hasil Race" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-xl font-bold">Papan Hasil</div>
                        <div className="text-sm text-neutral-500">
                            {finisher_count} peserta telah finish
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={timingIndex().url}>
                                <Timer className="size-4" />
                                Input Timing
                            </Link>
                        </Button>
                        <Button asChild className="bg-[#C6242D] hover:bg-[#a91e26] text-[#FFF6E5]">
                            <Link href={publicMethod().url} target="_blank">
                                <ExternalLink className="size-4" />
                                Papan Publik
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Trophy className="size-4 text-amber-500" />
                                Top 10 Keseluruhan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Rank</th>
                                        <th className="pb-2 pr-4">Peserta</th>
                                        <th className="pb-2 pr-4">BIB</th>
                                        <th className="pb-2 pr-4">Kategori</th>
                                        <th className="pb-2">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overall.map((row) => (
                                        <tr key={row.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="py-3 pr-4">
                                                <span className="inline-flex size-7 items-center justify-center rounded-full bg-neutral-100 font-mono text-xs font-bold dark:bg-neutral-800">
                                                    {row.rank}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="font-semibold">{row.name}</div>
                                                <div className="font-mono text-xs text-neutral-500">{row.code}</div>
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-xs font-bold">{row.race_number ?? '-'}</td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary">{row.category}</Badge>
                                            </td>
                                            <td className="py-3 font-mono font-bold">{row.finish_time}</td>
                                        </tr>
                                    ))}
                                    {overall.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                                                Belum ada peserta yang finish.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {perCategory.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <Medal className="size-4 text-amber-500" />
                                    Kategori {group.distance} · {group.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
                                            <th className="pb-2 pr-4">Rank</th>
                                            <th className="pb-2 pr-4">Peserta</th>
                                            <th className="pb-2">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.finishers.map((row) => (
                                            <tr key={row.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                                <td className="py-3 pr-4">
                                                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-neutral-100 font-mono text-xs font-bold dark:bg-neutral-800">
                                                        {row.rank}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold">{row.name}</div>
                                                    <div className="font-mono text-xs text-neutral-500">{row.code}</div>
                                                </td>
                                                <td className="py-3 font-mono font-bold">{row.finish_time}</td>
                                            </tr>
                                        ))}
                                        {group.finishers.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-sm text-neutral-500">
                                                    Belum ada finisher.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminResults.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Hasil Race',
            href: resultsIndex().url,
        },
    ],
};