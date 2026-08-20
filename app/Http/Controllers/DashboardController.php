<?php

namespace App\Http\Controllers;

use App\Enums\RegistrationStatus;
use App\Models\Category;
use App\Models\Registration;
use App\Support\EventSettings;
use App\Support\RaceTiming;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with admin stats for admins, or the runner's registration for participants.
     */
    public function __invoke(): Response
    {
        $isAdmin = auth()->user()?->isAdmin() ?? false;

        $stats = $isAdmin ? [
            'total' => Registration::count(),
            'verified' => Registration::where('status', RegistrationStatus::Verified)->count(),
            'pending_verification' => Registration::where('status', RegistrationStatus::PendingVerification)->count(),
            'pending_payment' => Registration::where('status', RegistrationStatus::PendingPayment)->count(),
            'revenue' => Registration::where('status', RegistrationStatus::Verified)->sum('total_amount'),
        ] : null;

        $recent = $isAdmin ? Registration::query()
            ->with('category')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Registration $registration) => [
                'code' => $registration->code,
                'name' => $registration->name,
                'category' => $registration->category->distance,
                'status' => $registration->status->value,
                'status_label' => $registration->status->label(),
                'race_number' => $registration->race_number,
                'created_at' => $registration->created_at->format('d M Y H:i'),
            ]) : [];

        $registration = $isAdmin ? null : Registration::query()
            ->with('category', 'latestPayment')
            ->where('email', auth()->user()?->email)
            ->latest()
            ->first();

        return Inertia::render('dashboard', [
            'is_admin' => $isAdmin,
            'stats' => $stats,
            'recent' => $recent,
            'analytics' => $isAdmin ? $this->analytics() : null,
            'registration' => $registration ? $this->runnerPayload($registration) : null,
            'event' => [
                'event_name' => EventSettings::get('event_name', (string) config('app.name')),
                'event_date' => EventSettings::get('event_date'),
                'event_location' => EventSettings::get('event_location'),
            ],
        ]);
    }

    /**
     * Build the analytics dataset for the admin dashboard, straight from the database.
     *
     * @return array<string, mixed>
     */
    private function analytics(): array
    {
        $now = now();
        $weekStart = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();
        $prevMonthStart = $monthStart->copy()->subMonthNoOverflow();

        $verified = fn ($query) => $query->where('status', RegistrationStatus::Verified);
        $pending = fn ($query) => $query->whereIn('status', [RegistrationStatus::PendingPayment, RegistrationStatus::PendingVerification]);

        $monthRevenue = (int) $verified(Registration::query())->whereBetween('created_at', [$monthStart, $now])->sum('total_amount');
        $prevMonthRevenue = (int) $verified(Registration::query())->whereBetween('created_at', [$prevMonthStart, $monthStart])->sum('total_amount');
        $sevenDaysAgo = $now->copy()->subDays(6)->startOfDay();
        $fourteenDaysAgo = $now->copy()->subDays(13)->startOfDay();
        $weekCount = Registration::where('created_at', '>=', $sevenDaysAgo)->count();
        $prevWeekCount = Registration::whereBetween('created_at', [$fourteenDaysAgo, $sevenDaysAgo])->count();

        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        $revenueWeekly = [];
        for ($i = 11; $i >= 0; $i--) {
            $start = $weekStart->copy()->subWeeks($i);
            $end = $start->copy()->addWeek();
            $revenueWeekly[] = [
                'label' => $start->format('d/m'),
                'earn' => (int) $verified(Registration::query())->whereBetween('created_at', [$start, $end])->sum('total_amount'),
                'expense' => (int) $pending(Registration::query())->whereBetween('created_at', [$start, $end])->sum('total_amount'),
            ];
        }

        $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $start = $monthStart->copy()->subMonthsNoOverflow($i);
            $end = $start->copy()->addMonth();
            $monthly[] = [
                'label' => $monthLabels[$start->month - 1],
                'value' => (int) $verified(Registration::query())->whereBetween('created_at', [$start, $end])->sum('total_amount'),
            ];
        }

        $colors = ['#0f766e', '#ea580c', '#18181b', '#C6242D', '#FFC93C'];
        $categoryShare = Registration::query()
            ->selectRaw('category_id, SUM(total_amount) as total')
            ->where('status', RegistrationStatus::Verified)
            ->groupBy('category_id')
            ->get()
            ->map(function ($row, $index) use ($colors): array {
                $category = Category::find($row->category_id);

                return [
                    'name' => $category?->distance ?? '-',
                    'value' => (int) $row->total,
                    'color' => $colors[$index % count($colors)],
                ];
            })
            ->values()
            ->all();

        $weeklyTrend = [];
        $weeklyArea = [];
        for ($i = 6; $i >= 0; $i--) {
            $start = $now->copy()->subDays($i)->startOfDay();
            $end = $start->copy()->addDay();
            $label = $dayLabels[$start->dayOfWeekIso - 1];
            $weeklyTrend[] = [
                'day' => $label,
                'verified' => $verified(Registration::query())->whereBetween('created_at', [$start, $end])->count(),
                'pending' => $pending(Registration::query())->whereBetween('created_at', [$start, $end])->count(),
            ];
            $weeklyArea[] = [
                'label' => $label,
                'value' => Registration::whereBetween('created_at', [$start, $end])->count(),
            ];
        }

        $topCategoryRow = Registration::query()
            ->selectRaw('category_id, COUNT(*) as total')
            ->where('status', RegistrationStatus::Verified)
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->first();
        $topCategory = $topCategoryRow ? Category::find($topCategoryRow->category_id) : null;
        $verifiedCount = Registration::where('status', RegistrationStatus::Verified)->count();
        $racePackCount = Registration::whereNotNull('pickup_at')->count();
        $checkedInCount = Registration::whereNotNull('checked_in_at')->count();

        $transactions = Registration::query()
            ->with('category')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Registration $registration): array => [
                'name' => $registration->name,
                'code' => $registration->code,
                'desc' => ($registration->category?->distance ?? '-').' · '.$registration->status->label(),
                'amount' => $registration->total_amount,
                'positive' => $registration->status !== RegistrationStatus::Cancelled,
                'status' => $registration->status->value,
            ]);

        return [
            'overview' => [
                'revenue' => (int) $verified(Registration::query())->sum('total_amount'),
                'revenue_pct' => $this->pctChange($monthRevenue, $prevMonthRevenue),
                'verified' => $verifiedCount,
                'pending_verification' => Registration::where('status', RegistrationStatus::PendingVerification)->count(),
                'total' => Registration::count(),
                'week_count' => $weekCount,
                'week_pct' => $this->pctChange($weekCount, $prevWeekCount),
                'month_revenue' => $monthRevenue,
                'month_pending' => (int) $pending(Registration::query())->whereBetween('created_at', [$monthStart, $now])->sum('total_amount'),
            ],
            'revenue_weekly' => $revenueWeekly,
            'monthly' => $monthly,
            'category_share' => $categoryShare,
            'weekly_trend' => $weeklyTrend,
            'weekly_area' => $weeklyArea,
            'top_stats' => [
                ['title' => 'Kategori Terpopuler', 'desc' => $topCategory ? $topCategory->distance.' · '.$topCategory->name : '-', 'value' => $topCategoryRow?->total ?? 0, 'suffix' => 'pendaftar'],
                ['title' => 'Race Pack Diambil', 'desc' => 'Dari pendaftar lunas', 'value' => $verifiedCount > 0 ? (int) round($racePackCount / $verifiedCount * 100) : 0, 'suffix' => '%'],
                ['title' => 'Sudah Check-in', 'desc' => 'Siap di start line', 'value' => $verifiedCount > 0 ? (int) round($checkedInCount / $verifiedCount * 100) : 0, 'suffix' => '%'],
            ],
            'transactions' => $transactions,
        ];
    }

    /**
     * Percentage change between two values, clamped to 100.
     */
    private function pctChange(int $current, int $previous): int
    {
        if ($previous <= 0) {
            return $current > 0 ? 100 : 0;
        }

        return (int) round(($current - $previous) / $previous * 100);
    }

    /**
     * @return array<string, mixed>
     */
    private function runnerPayload(Registration $registration): array
    {
        $payment = $registration->latestPayment;
        $distanceKm = $registration->category->distanceKm();
        $result = $registration->finish_seconds !== null ? [
            'finish_time' => RaceTiming::formatSeconds($registration->finish_seconds),
            'pace' => RaceTiming::pacePerKm($registration->finish_seconds, $distanceKm),
            'overall_rank' => RaceTiming::rank($registration->finish_seconds),
            'category_rank' => RaceTiming::rank($registration->finish_seconds, $registration->category_id),
        ] : null;

        return [
            'code' => $registration->code,
            'name' => $registration->name,
            'category' => $registration->category->distance,
            'category_name' => $registration->category->name,
            'status' => $registration->status->value,
            'status_label' => $registration->status->label(),
            'race_number' => $registration->race_number,
            'total_amount' => $registration->total_amount,
            'payment_status' => $payment?->status->value,
            'payment_status_label' => $payment?->status->label(),
            'pickup_at' => $registration->pickup_at?->format('d M Y H:i'),
            'checked_in_at' => $registration->checked_in_at?->format('d M Y H:i'),
            'paid_at' => $registration->paid_at?->format('d M Y H:i'),
            'result' => $result,
            'photo_count' => $registration->race_number
                ? $registration->racePhotos()->where('bib', $registration->race_number)->count()
                : 0,
        ];
    }
}
