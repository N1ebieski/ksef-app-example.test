<?php

namespace App\Http\Controllers\Ksef\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ksef\Auth\AuthenticateRequest;
use DateTimeImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use N1ebieski\KSEFClient\Contracts\Resources\ClientResourceInterface;
use N1ebieski\KSEFClient\Requests\Auth\XadesSignature\XadesSignatureXmlRequest;
use N1ebieski\KSEFClient\Support\Utility;
use N1ebieski\KSEFClient\ValueObjects\AccessToken;

class AuthenticateController extends Controller
{
    public function __construct(private readonly ClientResourceInterface $client)
    {
    }

    public function __invoke(AuthenticateRequest $request): JsonResponse
    {
        $xadesSignatureResponse = $this->client->auth()->xadesSignature(
            new XadesSignatureXmlRequest($request->string('document'))
        )->object();

        $client = $this->client->withAccessToken($xadesSignatureResponse->authenticationToken->token);

        $statusResponse = Utility::retry(function () use ($client, $xadesSignatureResponse) {
            $response = $client->auth()->status([
                'referenceNumber' => $xadesSignatureResponse->referenceNumber
            ])->object();

            if ($response->status->code === 200 || $response->status->code >= 400) {
                return $response;
            }
        });

        if ($statusResponse->status->code === 200) {
            $redeemResponse = $client->auth()->token()->redeem()->object();

            $accessToken = AccessToken::from(
                token: $redeemResponse->accessToken->token,
                validUntil: new DateTimeImmutable($redeemResponse->accessToken->validUntil)
            );
            $refreshToken = AccessToken::from(
                token: $redeemResponse->refreshToken->token,
                validUntil: new DateTimeImmutable($redeemResponse->refreshToken->validUntil)
            );

            $request->session()->put('ksef.access_token', $accessToken);
            $request->session()->put('ksef.refresh_token', $refreshToken);

            $client->withAccessToken($accessToken)->withRefreshToken($refreshToken);
        }

        return Response::json($statusResponse);
    }
}
