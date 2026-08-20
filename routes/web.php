<?php

use App\Http\Controllers\Admin\BibController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CertificateController as AdminCertificateController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\GuestStarController;
use App\Http\Controllers\Admin\LeaderboardController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PhotosController;
use App\Http\Controllers\Admin\RaceOpsController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ResultsController as AdminResultsController;
use App\Http\Controllers\Admin\RouteMapController;
use App\Http\Controllers\Admin\RunnerController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RacePhotoController;
use App\Http\Controllers\RaceResultController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RegistrationStatusController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/daftar', [RegistrationController::class, 'create'])->name('registration.create');
Route::post('/daftar', [RegistrationController::class, 'store'])->name('registration.store');
Route::get('/cek-status/{code?}', RegistrationStatusController::class)->name('registration.status');
Route::post('/cek-status/recover', [RegistrationStatusController::class, 'recover'])->name('registration.recover');
Route::post('/pendaftaran/{registration}/bukti', [PaymentController::class, 'storeProof'])->name('registration.proof');
Route::get('/hasil', RaceResultController::class)->name('results.public');
Route::get('/foto/{bib?}', RacePhotoController::class)->name('photos.lookup');
Route::get('/sertifikat/{code}', CertificateController::class)->name('certificate');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'is_admin'])
    ->group(function () {
        Route::get('/registrations', [AdminRegistrationController::class, 'index'])->name('registrations.index');
        Route::get('/registrations/export', [AdminRegistrationController::class, 'export'])->name('registrations.export');
        Route::get('/registrations/{registration}', [AdminRegistrationController::class, 'show'])->name('registrations.show');

        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments/{payment}/verify', [AdminPaymentController::class, 'verifyPayment'])->name('payments.verify');
        Route::post('/payments/{payment}/reject', [AdminPaymentController::class, 'rejectPayment'])->name('payments.reject');

        Route::get('/runners', [RunnerController::class, 'index'])->name('runners.index');
        Route::get('/bibs', [BibController::class, 'index'])->name('bibs.index');

        Route::get('/events', [EventController::class, 'index'])->name('events.index');
        Route::post('/events', [EventController::class, 'update'])->name('events.update');

        Route::get('/guest-stars', [GuestStarController::class, 'index'])->name('guest-stars.index');
        Route::post('/guest-stars', [GuestStarController::class, 'store'])->name('guest-stars.store');
        Route::put('/guest-stars/{guestStar}', [GuestStarController::class, 'update'])->name('guest-stars.update');
        Route::delete('/guest-stars/{guestStar}', [GuestStarController::class, 'destroy'])->name('guest-stars.destroy');

        Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');
        Route::post('/gallery', [GalleryController::class, 'store'])->name('gallery.store');
        Route::put('/gallery/{item}', [GalleryController::class, 'update'])->name('gallery.update');
        Route::delete('/gallery/{item}', [GalleryController::class, 'destroy'])->name('gallery.destroy');

        Route::get('/route-maps', [RouteMapController::class, 'index'])->name('route-maps.index');
        Route::post('/route-maps', [RouteMapController::class, 'store'])->name('route-maps.store');
        Route::put('/route-maps/{routeMap}', [RouteMapController::class, 'update'])->name('route-maps.update');
        Route::delete('/route-maps/{routeMap}', [RouteMapController::class, 'destroy'])->name('route-maps.destroy');

        Route::get('/timing', [AdminResultsController::class, 'index'])->name('timing.index');
        Route::post('/timing', [AdminResultsController::class, 'update'])->name('timing.update');
        Route::post('/timing/import', [AdminResultsController::class, 'import'])->name('timing.import');

        Route::get('/results', LeaderboardController::class)->name('results.index');

        Route::get('/certificates', [AdminCertificateController::class, 'index'])->name('certificates.index');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

        Route::get('/race-pack', [RaceOpsController::class, 'racePackIndex'])->name('race-pack');
        Route::post('/race-pack/pickup', [RaceOpsController::class, 'pickup'])->name('race-pack.pickup');
        Route::get('/check-in', [RaceOpsController::class, 'checkinIndex'])->name('check-in');
        Route::post('/check-in/checkin', [RaceOpsController::class, 'checkin'])->name('check-in.checkin');
        Route::get('/photos', [PhotosController::class, 'index'])->name('photos.index');
        Route::get('/photos/bibs', [PhotosController::class, 'bibSuggestions'])->name('photos.bibs');
        Route::post('/photos', [PhotosController::class, 'store'])->name('photos.store');
        Route::delete('/photos/{photo}', [PhotosController::class, 'destroy'])->name('photos.destroy');
    });

require __DIR__.'/settings.php';
