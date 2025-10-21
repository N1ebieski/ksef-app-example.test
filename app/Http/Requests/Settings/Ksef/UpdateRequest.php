<?php

namespace App\Http\Requests\Settings\Ksef;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => [
                'bail',
                'required',
                'numeric',
                'regex:/[1-9]((\\d[1-9])|([1-9]\\d))\\d{7}/'
            ],
            'certificate' => [
                'bail',
                'required',
                'string'
            ]
        ];
    }
}
