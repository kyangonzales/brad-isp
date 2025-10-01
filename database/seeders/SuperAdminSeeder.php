<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {

        // ✅ Super Admin account
        User::create([
            'name' => 'Super Admin',
            'email' => 'kyangonzales83@gmail.com',
            'password' => bcrypt('kyankyan'),
            'role' => 'superadmin',
            'status' => 'active',
        ]);

        // ✅ Regular User account
        User::create([
            'name' => 'Regular User',
            'email' => 'ulydelacruz8@gmail.com',
            'password' => bcrypt('123456789'),
            'role' => 'user',
            'status' => 'active',
        ]);
    }
}
