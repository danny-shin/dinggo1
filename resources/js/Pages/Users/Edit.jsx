import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ auth, user }) {
	const { data, setData, patch, processing, errors } = useForm({
		name: user.name || '',
		email: user.email || '',
		password: '',
		password_confirmation: '',
	});

	const submit = (e) => {
		e.preventDefault();
		patch(route('users.update', user.id));
	};

	return (
		<AdminLayout user={auth.user}>
			<Head title="Edit User" />

			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link href={route('users.index')}>
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
						<p className="text-muted-foreground">
							Update user information
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>User Information</CardTitle>
						<CardDescription>
							Update the user details below
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={submit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={data.name}
									onChange={(e) => setData('name', e.target.value)}
									className={errors.name ? 'border-destructive' : ''}
								/>
								{errors.name && (
									<p className="text-sm text-destructive">{errors.name}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={data.email}
									onChange={(e) => setData('email', e.target.value)}
									className={errors.email ? 'border-destructive' : ''}
								/>
								{errors.email && (
									<p className="text-sm text-destructive">{errors.email}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">New Password (leave blank to keep current)</Label>
								<Input
									id="password"
									type="password"
									value={data.password}
									onChange={(e) => setData('password', e.target.value)}
									className={errors.password ? 'border-destructive' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-destructive">{errors.password}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password_confirmation">Confirm New Password</Label>
								<Input
									id="password_confirmation"
									type="password"
									value={data.password_confirmation}
									onChange={(e) => setData('password_confirmation', e.target.value)}
								/>
							</div>

							<div className="flex gap-2">
								<Button type="submit" disabled={processing}>
									Update User
								</Button>
								<Link href={route('users.index')}>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
