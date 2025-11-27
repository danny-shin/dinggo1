import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function Show({ auth, quote }) {
	return (
		<AdminLayout user={auth.user}>
			<Head title={`Quote #${quote.id}`} />

			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link href={route('quotes.index')}>
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h2 className="text-3xl font-bold tracking-tight">
							Quote #{quote.id}
						</h2>
						<p className="text-muted-foreground">
							Repairer: {quote.repairer}
						</p>
					</div>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle>Quote Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Price</p>
									<p className="text-2xl font-bold">${quote.price}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Created At</p>
									<p>{new Date(quote.created_at).toLocaleDateString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle>Overview of Work</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap">{quote.overview_of_work}</p>
						</CardContent>
					</Card>

					{quote.car && (
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>Vehicle Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Make/Model</p>
										<p>{quote.car.make} {quote.car.model}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Year</p>
										<p>{quote.car.year}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">License Plate</p>
										<p>{quote.car.license_plate}</p>
									</div>
									<div>
										<Link href={route('cars.show', quote.car.id)}>
											<Button variant="outline" size="sm">
												View Vehicle
											</Button>
										</Link>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</AdminLayout>
	);
}
