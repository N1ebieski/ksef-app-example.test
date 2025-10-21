<?php

namespace App\Http\Controllers\Ksef\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use N1ebieski\KSEFClient\Contracts\Resources\ClientResourceInterface;
use N1ebieski\KSEFClient\DTOs\Requests\Auth\XadesSignature;

class XadesSignatureController extends Controller
{
    public function __construct(private readonly ClientResourceInterface $client)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $response = $this->client->auth()->challenge()->object();

        $xml = XadesSignature::from([
            'challenge' => $response->challenge,
            'contextIdentifierGroup' => [
                'identifierGroup' => [
                    'nip' => $user->certificate->identifier
                ]
            ],
            'subjectIdentifierType' => 'certificateSubject'
        ])->toXml();

        return Response::json([
            'document' => $xml,
            'certificate' => $user->certificate->certificate
        ]);
    }
}
