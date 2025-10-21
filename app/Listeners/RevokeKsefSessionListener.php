<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Session;
use N1ebieski\KSEFClient\Contracts\Resources\ClientResourceInterface;
use Illuminate\Http\Response as HttpResponse;

class RevokeKsefSessionListener
{
    public function __construct(private readonly ClientResourceInterface $client)
    {
    }

    public function handle(Logout $event): void
    {
        if (Session::missing('ksef.refresh_token')) {
            return;
        }

        $status = $this->client->auth()->sessions()->revokeCurrent()->status();

        if ($status === HttpResponse::HTTP_NO_CONTENT) {
            Session::remove('ksef.access_token');
            Session::remove('ksef.refresh_token');
        }
    }
}
