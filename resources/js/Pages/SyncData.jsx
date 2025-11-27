//import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
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
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';

// export default function Index({ auth, users, filters }) {
export default function SyncData({ auth }) {
	const [syncing, setSyncing] = useState(false);
	const [syncStats, setSyncStats] = useState(null);
	const [syncError, setSyncError] = useState(null);

	const handleSync = async () => {
		setSyncing(true);
		setSyncError(null);

		try {
			const response = await axios.post(route('sync.data'));
			const data = response.data;

			if (data.success) {
				setSyncStats(data.stats);
			} else {
				setSyncError(data.message);
			}
		} catch (error) {
			setSyncError('Failed to sync data: ' + (error.response?.data?.message || error.message));
		} finally {
			setSyncing(false);
		}
	};

	return (
		<AdminLayout user={auth.user}>
			<Head title="Sync Data" />

			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">Sync Data</h2>
						<p className="text-muted-foreground">
							DingGo Admin Sync Data
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Sync DingGo Data</CardTitle>
						<CardDescription>
							Fetch cars and quotes from DingGo API and save to database
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							onClick={handleSync}
							disabled={syncing}
							className="gap-2"
						>
							<RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
							{syncing ? 'Syncing...' : 'Sync Data'}
						</Button>

						{syncError && (
							<div className="rounded-md bg-red-50 p-4 text-red-800">
								{syncError}
							</div>
						)}

						{syncStats && (
							<div className="space-y-2">
								<h3 className="font-semibold">Sync Statistics</h3>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Table</TableHead>
												<TableHead>Read (Total)</TableHead>
												<TableHead>Inserted (New)</TableHead>
												<TableHead>Updated (Changed)</TableHead>
												<TableHead>Unchanged</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">Cars</TableCell>
												<TableCell>{syncStats.cars.read}</TableCell>
												<TableCell>{syncStats.cars.inserted}</TableCell>
												<TableCell>{syncStats.cars.updated}</TableCell>
												<TableCell>{syncStats.cars.unchanged}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Quotes</TableCell>
												<TableCell>{syncStats.quotes.read}</TableCell>
												<TableCell>{syncStats.quotes.inserted}</TableCell>
												<TableCell>{syncStats.quotes.updated}</TableCell>
												<TableCell>{syncStats.quotes.unchanged}</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
