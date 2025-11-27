<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Quote extends Model
{
  use HasFactory;
  protected $fillable = [
    'car_id',
    'price',
    'repairer',
    'overview_of_work'
  ];

  // Relationship: A quote belongs to a car
  public function car(): BelongsTo
  {
    return $this->belongsTo(Car::class);
  }
}
