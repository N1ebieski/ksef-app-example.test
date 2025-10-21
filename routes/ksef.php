<?php

use App\Http\Controllers\Ksef\Auth\AuthenticateController;
use App\Http\Controllers\Ksef\Auth\XadesSignatureController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')
    ->prefix('ksef/auth')
    ->name('ksef.auth.')
    ->group(function () {
        Route::get('xades-signature', XadesSignatureController::class)->name('xades-signature');
        Route::post('authenticate', AuthenticateController::class)->name('authenticate');
    });
