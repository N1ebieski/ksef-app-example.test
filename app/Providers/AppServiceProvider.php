<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use N1ebieski\KSEFClient\ClientBuilder;
use N1ebieski\KSEFClient\Contracts\Resources\ClientResourceInterface;
use N1ebieski\KSEFClient\ValueObjects\Mode;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(ClientResourceInterface::class, function (Application $app) {
            /** @var Request $request */
            $request = $app->make(Request::class);

            /** @var User $user */
            $user = $request->user();

            $client = (new ClientBuilder())->withMode(Mode::Test);

            if ($user->certificate?->identifier !== null) {
                $client = $client->withIdentifier($user->certificate->identifier);
            }

            if ($request->session()->has('ksef.access_token')) {
                $client = $client->withAccessToken($request->session()->get('ksef.access_token'));
            }

            if ($request->session()->has('ksef.refresh_token')) {
                $client = $client->withRefreshToken($request->session()->get('ksef.refresh_token'));
            }

            return $client->build();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
