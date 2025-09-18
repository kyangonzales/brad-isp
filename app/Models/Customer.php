<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';

    protected $fillable = [
        'fullname',
        'phone',
        'purok',
        'sitio',
        'barangay',
        'branch',
        'notes',
        'plan_id',
        'duedate',
        'state',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

}