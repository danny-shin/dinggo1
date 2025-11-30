import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Eye } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, cars, filters }) {
	const [search, setSearch] = useState(filters.search || '');

	const handleSearch = (e) => {
		e.preventDefault();
		router.get(route('cars.index'), { search }, { preserveState: true });
	};

	return (
		<AdminLayout user={auth.user}>
			<Head title="Cars" />

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Cars 20251130.1505</h2>
						<p className="text-muted-foreground">
							Manage cars in the system
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>All Cars</CardTitle>
						<CardDescription>
							A list of all cars
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSearch} className="mb-4">
							<Input
								type="text"
								placeholder="Search cars..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="max-w-sm"
							/>
						</form>

						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Make</TableHead>
										<TableHead>Model</TableHead>
										<TableHead>Year</TableHead>
										<TableHead>License Plate</TableHead>
										<TableHead>State</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{cars.data.length > 0 ? (
										cars.data.map((car) => (
											<TableRow key={car.id}>
												<TableCell className="font-medium">{car.make}</TableCell>
												<TableCell>{car.model}</TableCell>
												<TableCell>{car.year}</TableCell>
												<TableCell>{car.license_plate}</TableCell>
												<TableCell>{car.license_state}</TableCell>
												<TableCell className="text-right">
													<Link href={route('cars.show', car.id)}>
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
											<TableCell colSpan={6} className="text-center text-muted-foreground">
												No cars found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{cars.links.length > 3 && (
							<div className="flex items-center justify-center gap-2 mt-4">
								{cars.links.map((link, index) => (
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
