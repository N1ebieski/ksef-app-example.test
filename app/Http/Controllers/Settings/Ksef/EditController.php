<?php

namespace App\Http\Controllers\Settings\Ksef;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EditController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('settings/Ksef');
    }
}
