<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
	/**
	 * Display a listing of the resource.
	 */
	public function index(Request $request)
	{
		$search = $request->get('search', '');

		$quotes = Quote::query()
			->with('car')
			->when($search, function ($query, $search) {
				$query->where('repairer', 'like', "%{$search}%")
					->orWhereHas('car', function ($q) use ($search) {
						$q->where('license_plate', 'like', "%{$search}%");
					});
			})
			->latest()
			->paginate(10)
			->withQueryString();

		return Inertia::render('Quotes/Index', [
			'quotes' => $quotes,
			'filters' => ['search' => $search],
		]);
	}

	/**
	 * Display the specified resource.
	 */
	public function show(Quote $quote)
	{
		$quote->load('car');

		return Inertia::render('Quotes/Show', [
			'quote' => $quote,
		]);
	}
}
