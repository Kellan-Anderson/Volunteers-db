import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export default async function DashboardPage() {

	const volunteers = await api.volunteers.getVolunteers.query();

	return (
		<>
			<header className="flex flex-row justify-between items-center p-2 pl-14 lg:pl-2 border-b">
				<h1 className="font-bold text-lg">Volunteers</h1>
				<AddVolunteerButton />
			</header>
			{volunteers.map((v, i) => <div className="border border-b" key={i}>{JSON.stringify(v, null, 2)}</div>)}
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