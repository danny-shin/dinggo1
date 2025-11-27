<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarController extends Controller
{
	/**
	 * Display a listing of the resource.
	 */
	public function index(Request $request)
	{
		$search = $request->get('search', '');

		$cars = Car::query()
			->when($search, function ($query, $search) {
				$query->where('license_plate', 'ilike', "%{$search}%")
					->orWhere('make', 'ilike', "%{$search}%")
					->orWhere('model', 'ilike', "%{$search}%")
					->orWhere('vin', 'ilike', "%{$search}%");
			})
			->latest()
			->paginate(10)
			->withQueryString();

		return Inertia::render('Cars/Index', [
			'cars' => $cars,
			'filters' => ['search' => $search],
		]);
	}

	/**
	 * Display the specified resource.
	 */
	public function show(Car $car)
	{
		$car->load('quotes');

		return Inertia::render('Cars/Show', [
			'car' => $car,
		]);
	}
}
