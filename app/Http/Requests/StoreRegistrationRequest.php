<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'nik' => ['nullable', 'string', 'size:16'],
            'gender' => ['required', Rule::in(['men', 'women'])],
            'birth_date' => ['required', 'date', 'before:today', 'after:-100 years'],
            'city' => ['required', 'string', 'max:100'],
            'jersey_size' => ['required', Rule::in(['S', 'M', 'L', 'XL', 'XXL'])],
            'emergency_name' => ['required', 'string', 'max:100'],
            'emergency_phone' => ['required', 'string', 'max:20'],
            'community' => ['nullable', 'string', 'max:100'],
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
            'category_id.required' => 'Pilih kategori lari terlebih dahulu.',
            'category_id.exists' => 'Kategori lari tidak ditemukan.',
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'phone.required' => 'Nomor HP wajib diisi.',
            'gender.required' => 'Pilih jenis kelamin.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
            'city.required' => 'Asal kota wajib diisi.',
            'jersey_size.required' => 'Pilih ukuran jersey.',
            'emergency_name.required' => 'Nama kontak darurat wajib diisi.',
            'emergency_phone.required' => 'Nomor kontak darurat wajib diisi.',
            'nik.size' => 'NIK harus 16 digit.',
        ];
    }
}
