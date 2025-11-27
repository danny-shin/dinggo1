import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "@/Components/ThemeProvider"
import Dropdown from "@/Components/Dropdown"

export function ThemeToggle() {
	const { setTheme } = useTheme()

	return (
		<Dropdown>
			<Dropdown.Trigger>
				<button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</button>
			</Dropdown.Trigger>
			<Dropdown.Content align="end">
				<Dropdown.Button onClick={() => setTheme("light")}>
					<div className="flex items-center gap-2">
						<Sun className="h-4 w-4" />
						<span>Light</span>
					</div>
				</Dropdown.Button>
				<Dropdown.Button onClick={() => setTheme("dark")}>
					<div className="flex items-center gap-2">
						<Moon className="h-4 w-4" />
						<span>Dark</span>
					</div>
				</Dropdown.Button>
				<Dropdown.Button onClick={() => setTheme("system")}>
					<div className="flex items-center gap-2">
						<Laptop className="h-4 w-4" />
						<span>System</span>
					</div>
				</Dropdown.Button>
			</Dropdown.Content>
		</Dropdown>
	)
}
