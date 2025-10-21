<?php

namespace App\Http\Controllers\Settings\Ksef;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Ksef\UpdateRequest;
use App\Models\User;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Response as HttpResponse;

class UpdateController extends Controller
{
    public function __invoke(UpdateRequest $request): HttpResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->certificate()->delete();
        $user->certificate()->create($request->validated());

        return Response::noContent(HttpResponse::HTTP_NO_CONTENT);
    }
}
