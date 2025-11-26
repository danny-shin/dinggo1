import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
	LayoutDashboard,
	Users,
	Settings,
	Menu,
	X
} from 'lucide-react';
import { useState } from 'react';

const sidebarItems = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Users', href: '/users', icon: Users },
	{ name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminLayout({ children, user }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex h-screen bg-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/80 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="flex h-full flex-col">
					{/* Logo */}
					<div className="flex h-16 items-center justify-between border-b px-6">
						<Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
							<LayoutDashboard className="h-6 w-6" />
							<span>Admin</span>
						</Link>
						<button
							className="lg:hidden"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 px-3 py-4">
						{sidebarItems.map((item) => {
							const Icon = item.icon;
							const isActive = route().current(item.href.slice(1));

							return (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									)}
								>
									<Icon className="h-5 w-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* User section */}
					<div className="border-t p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
								{user?.name?.[0]?.toUpperCase() || '?'}
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="text-sm font-medium truncate">{user?.name}</p>
								<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Top bar */}
				<header className="flex h-16 items-center border-b bg-card px-6">
					<button
						className="lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="h-6 w-6" />
					</button>
					<div className="flex-1" />
				</header>

				{/* Page content */}
				<main className="flex-1 overflow-auto p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
