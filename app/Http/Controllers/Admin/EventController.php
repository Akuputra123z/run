<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\EventSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Show the event settings form.
     */
    public function index(): Response
    {
        return Inertia::render('admin/event', [
            'settings' => [
                'event_name' => EventSettings::get('event_name', (string) config('app.name')),
                'event_date' => EventSettings::get('event_date'),
                'event_location' => EventSettings::get('event_location'),
                'bank' => EventSettings::get('bank', (string) config('registration.bank')),
                'account_number' => EventSettings::get('account_number', (string) config('registration.account_number')),
                'account_name' => EventSettings::get('account_name', (string) config('registration.account_name')),
                'payment_hours' => EventSettings::get('payment_hours', (string) config('registration.payment_hours')),
                'race_pack_dates' => EventSettings::json('race_pack_dates'),
                'race_pack_location' => EventSettings::get('race_pack_location'),
                'start_date' => EventSettings::get('start_date'),
                'start_times' => EventSettings::json('start_times'),
                'doorprize_badge' => EventSettings::get('doorprize_badge'),
                'doorprize_event_name' => EventSettings::get('doorprize_event_name'),
                'doorprize_title' => EventSettings::get('doorprize_title'),
            ],
        ]);
    }

    /**
     * Persist the event settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_name' => ['required', 'string', 'max:100'],
            'event_date' => ['nullable', 'string', 'max:50'],
            'event_location' => ['nullable', 'string', 'max:200'],
            'bank' => ['required', 'string', 'max:50'],
            'account_number' => ['required', 'string', 'max:30'],
            'account_name' => ['required', 'string', 'max:100'],
            'payment_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'race_pack_dates' => ['nullable', 'array', 'max:10'],
            'race_pack_dates.*' => ['required', 'string', 'max:50'],
            'race_pack_location' => ['nullable', 'string', 'max:200'],
            'start_date' => ['nullable', 'string', 'max:50'],
            'start_times' => ['nullable', 'array', 'max:20'],
            'start_times.*.distance' => ['required', 'string', 'max:10'],
            'start_times.*.time' => ['required', 'string', 'max:20'],
            'doorprize_badge' => ['nullable', 'string', 'max:100'],
            'doorprize_event_name' => ['nullable', 'string', 'max:200'],
            'doorprize_title' => ['nullable', 'string', 'max:100'],
        ]);

        $values = [
            'event_name' => $validated['event_name'],
            'event_date' => $validated['event_date'],
            'event_location' => $validated['event_location'],
            'bank' => $validated['bank'],
            'account_number' => $validated['account_number'],
            'account_name' => $validated['account_name'],
            'payment_hours' => (string) $validated['payment_hours'],
            'race_pack_dates' => json_encode($validated['race_pack_dates'] ?? [], JSON_UNESCAPED_UNICODE),
            'race_pack_location' => $validated['race_pack_location'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'start_times' => json_encode($validated['start_times'] ?? [], JSON_UNESCAPED_UNICODE),
            'doorprize_badge' => $validated['doorprize_badge'] ?? null,
            'doorprize_event_name' => $validated['doorprize_event_name'] ?? null,
            'doorprize_title' => $validated['doorprize_title'] ?? null,
        ];

        EventSettings::set(array_filter($values, fn ($value) => $value !== null));

        return back()->with('success', 'Pengaturan event disimpan.');
    }
}
