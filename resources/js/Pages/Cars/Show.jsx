import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function Show({ auth, car }) {
	return (
		<AdminLayout user={auth.user}>
			<Head title={`Car: ${car.license_plate}`} />

			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link href={route('cars.index')}>
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h2 className="text-3xl font-bold tracking-tight">
							{car.make} {car.model} ({car.year})
						</h2>
						<p className="text-muted-foreground">
							{car.license_plate} - {car.license_state}
						</p>
					</div>
				</div>

				{/* <div className="grid gap-6 md:grid-cols-2"> */}
				<div>
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle>Car Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">VIN</p>
									<p>{car.vin}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Colour</p>
									<p>{car.colour}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Make</p>
									<p>{car.make}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Model</p>
									<p>{car.model}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Year</p>
									<p>{car.year}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="mt-3 md:col-span-2">
						<CardHeader>
							<CardTitle>Linked Quotes</CardTitle>
							<CardDescription>Quotes associated with this car</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-2/8">Repairer</TableHead>
											<TableHead>Price</TableHead>
											<TableHead className="w-3/8">Overview</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{car.quotes && car.quotes.length > 0 ? (
											car.quotes.map((quote) => (
												<TableRow key={quote.id}>
													<TableCell className="font-medium">{quote.repairer}</TableCell>
													<TableCell>${quote.price}</TableCell>
													<TableCell className="max-w-md truncate">{quote.overview_of_work}</TableCell>
													<TableCell className="text-right">
														<a href={route('quotes.show', quote.id)} target="_blank" rel="noopener noreferrer">
															<Button variant="ghost" size="sm">
																<ExternalLink className="h-4 w-4 mr-2" />
																View Quote
															</Button>
														</a>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={4} className="text-center text-muted-foreground">
													No quotes found for this car
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AdminLayout>
	);
}
