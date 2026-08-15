<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRacePhotosRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize input before validation runs.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'bib' => strtoupper(trim((string) $this->input('bib'))),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bib' => ['required', 'string', 'max:12'],
            'photographer' => ['nullable', 'string', 'max:100'],
            'photos' => ['required', 'array', 'min:1', 'max:10'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'bib.required' => 'BIB / nomor dada wajib diisi.',
            'photos.required' => 'Pilih minimal satu foto untuk diunggah.',
            'photos.min' => 'Pilih minimal satu foto untuk diunggah.',
            'photos.max' => 'Maksimal 10 foto per unggahan.',
            'photos.*.image' => 'File harus berupa gambar.',
            'photos.*.mimes' => 'Format harus jpg, jpeg, png, atau webp.',
            'photos.*.max' => 'Ukuran gambar maksimal 5MB.',
        ];
    }
}
