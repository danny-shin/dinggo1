import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
	LayoutDashboard,
	Users,
	Settings,
	Menu,
	X,
	Car,
	FileText,
	RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import DingGoLogo from '@/Components/DingGoLogo';

const sidebarItems = [
	{ name: 'Cars', href: '/cars', icon: Car },
	{ name: 'Quotes', href: '/quotes', icon: FileText },
	{ name: 'Sync Data', href: '/sync-data', icon: RefreshCw },
	{ name: 'Users', href: '/users', icon: Users },
];

export default function AdminLayout({ children, user }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { env } = usePage().props;

	const getEnvDisplay = (env) => {
		switch (env) {
			case 'local':
				return 'Dev';
			case 'production':
				return 'Prod';
			default:
				return env
		}
	};

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
						<Link href="/" className="flex items-center gap-2 font-semibold text-lg">
							<DingGoLogo width="80" />
							<span className='ml-1 -mt-[6px] text-2xl font-[950] text-gray-600'>{getEnvDisplay(env)}</span>
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
							const isActive = route().current(item.href.slice(1) + '*');

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
				</div>
			</aside>

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">

				<header className="flex h-16 items-center border-b bg-card px-6">
					<button
						className="lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="h-6 w-6" />
					</button>
					<div className="flex-1" />

					<div className="flex items-center gap-4">

						{/* User Dropdown  */}
						<div id="user-top-btn" className="ml-4 flex items-center md:ml-6">
							<Dropdown>
								<Dropdown.Trigger>
									<span className="inline-flex rounded-md">
										<button
											type="button"
											className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
										>
											{/* {user?.name} */}

											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
													{user?.name?.[0]?.toUpperCase() || '?'}
												</div>
												<div className="flex-1 overflow-hidden">
													<p className="text-sm font-medium truncate">{user?.name}</p>
													<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
												</div>
											</div>

											<svg
												className="-me-0.5 ms-2 h-4 w-4"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</span>
								</Dropdown.Trigger>

								<Dropdown.Content>
									{/* <Dropdown.Link href={route('profile.edit')}>
										Profile
									</Dropdown.Link> */}
									<Dropdown.Link
										href={route('logout')}
										method="post"
										as="button"
									>
										Log Out
									</Dropdown.Link>
								</Dropdown.Content>
							</Dropdown>
						</div>
					</div>
				</header>

				{/* Page content */}
				<main className="flex-1 overflow-auto p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
