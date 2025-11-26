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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, users, filters }) {
	const [search, setSearch] = useState(filters.search || '');

	const handleSearch = (e) => {
		e.preventDefault();
		router.get(route('users.index'), { search }, { preserveState: true });
	};

	const deleteUser = (user) => {
		if (confirm(`Are you sure you want to delete ${user.name}?`)) {
			router.delete(route('users.destroy', user.id));
		}
	};

	return (
		<AdminLayout user={auth.user}>
			<Head title="Users" />

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Users</h2>
						<p className="text-muted-foreground">
							Manage user accounts
						</p>
					</div>
					<Link href={route('users.create')}>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add User
						</Button>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>All Users</CardTitle>
						<CardDescription>
							A list of all users in the system
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSearch} className="mb-4">
							<Input
								type="text"
								placeholder="Search users..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="max-w-sm"
							/>
						</form>

						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Created At</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.data.length > 0 ? (
										users.data.map((user) => (
											<TableRow key={user.id}>
												<TableCell className="font-medium">{user.name}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													{new Date(user.created_at).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Link href={route('users.edit', user.id)}>
															<Button variant="outline" size="sm">
																<Pencil className="h-4 w-4" />
															</Button>
														</Link>
														<Button
															variant="outline"
															size="sm"
															onClick={() => deleteUser(user)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={4} className="text-center text-muted-foreground">
												No users found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{users.links.length > 3 && (
							<div className="flex items-center justify-center gap-2 mt-4">
								{users.links.map((link, index) => (
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
