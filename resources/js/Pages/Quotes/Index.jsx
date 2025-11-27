import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
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
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, quotes, filters }) {
	const [search, setSearch] = useState(filters.search || '');

	const handleSearch = (e) => {
		e.preventDefault();
		router.get(route('quotes.index'), { search }, { preserveState: true });
	};

	return (
		<AdminLayout user={auth.user}>
			<Head title="Quotes" />

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Quotes</h2>
						<p className="text-muted-foreground">
							Manage quotes in the system
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>All Quotes</CardTitle>
						<CardDescription>
							A list of all quotes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSearch} className="mb-4">
							<Input
								type="text"
								placeholder="Search quotes..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="max-w-sm"
							/>
						</form>

						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-2/8">Repairer</TableHead>
										<TableHead>Car</TableHead>
										<TableHead>Price</TableHead>
										<TableHead className="w-3/8">Overview</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{quotes.data.length > 0 ? (
										quotes.data.map((quote) => (
											<TableRow key={quote.id}>
												<TableCell className="font-medium">{quote.repairer}</TableCell>
												<TableCell>
													{quote.car ? (
														<Link href={route('cars.show', quote.car.id)} className="hover:underline">
															{quote.car.license_plate} ({quote.car.make})
														</Link>
													) : 'N/A'}
												</TableCell>
												<TableCell>${quote.price}</TableCell>
												<TableCell className="max-w-md truncate">{quote.overview_of_work}</TableCell>
												<TableCell className="text-right">
													<Link href={route('quotes.show', quote.id)}>
														<Button variant="outline" size="sm">
															<Eye className="h-4 w-4 mr-2" />
															View
														</Button>
													</Link>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={5} className="text-center text-muted-foreground">
												No quotes found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{quotes.links.length > 3 && (
							<div className="flex items-center justify-center gap-2 mt-4">
								{quotes.links.map((link, index) => (
									<Button
										key={index}
										variant={link.active ? "default" : "outline"}
										size="sm"
										disabled={!link.url}
										onClick={() => link.url && router.visit(link.url)}
										dangerouslySetInnerHTML={{ __html: link.label }}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
