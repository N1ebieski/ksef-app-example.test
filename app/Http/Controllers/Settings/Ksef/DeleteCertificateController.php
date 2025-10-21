<?php

namespace App\Http\Controllers\Settings\Ksef;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Response as HttpResponse;

class DeleteCertificateController extends Controller
{
    public function __invoke(Request $request): HttpResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->certificate()->delete();

        return Response::noContent(HttpResponse::HTTP_NO_CONTENT);
    }
}
