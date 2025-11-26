<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::truncate();
        User::create([
            'name' => 'admin1',
            'email' => 'admin1@example.com',
            'email_verified_at' => now(),
            'password' => '123456789',
            //'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ]);

        // Create 50 mock users
        // User::factory()->count(50)->create();
    }
}
