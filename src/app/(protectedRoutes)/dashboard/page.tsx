import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function DashboardPage() {

	return (
		<>
			<header className="flex flex-row justify-between items-center p-2 border-b">
				<h1 className="font-bold text-lg">Volunteers</h1>
				<AddVolunteerButton />
			</header>
			this is the dashboard
		</>
	);
}

function AddVolunteerButton() {
	return (
		<Button
			asChild
			variant="outline"
		>
			<Link href={'/add-volunteer'} >Add Volunteer</Link>
		</Button>
	);
}