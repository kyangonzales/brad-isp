<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
	use HasFactory;

	protected $table = 'plans';

	protected $fillable = ['planName', 'price'];
	public function customers()
	{
		return $this->hasMany(Customer::class, 'plan_id');
	}

}