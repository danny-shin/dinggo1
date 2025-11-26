<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Car extends Model
{
    // We can use standard 'id', so we don't need to specify primaryKey or incrementing=false

    protected $fillable = [
        'license_plate', 'license_state', 'vin', 
        'year', 'colour', 'make', 'model'
    ];

    // Relationship: A car has many quotes
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }
}