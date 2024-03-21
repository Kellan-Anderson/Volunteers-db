import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { SearchBar } from "./_dashboardComponents/searchBar";
import { FilterArea } from "./_dashboardComponents/filterArea";

type DashboardPageProps = {
	searchParams: Record<string, string>
}

export default async function DashboardPage({ searchParams } : DashboardPageProps) {
	const searchQuery = [searchParams.query].flat().at(0);
	const urlFilters = [searchParams.filterBy ?? []].flat();

	const volunteers = await api.volunteers.getVolunteers.query({
		query: searchQuery,
		filterUrlIds: urlFilters
	});

	const filters = await api.filters.getAllFilters.query();

	return (
		<>
			<header className="flex flex-row justify-between items-center p-2 pl-14 lg:pl-2 border-b">
				<h1 className="font-bold text-lg">Volunteers</h1>
				<AddVolunteerButton />
			</header>
			<SearchBar />
			<div className="flex flex-row w-full">
				<section className="border border-black grow">
					{volunteers.map((v, i) => <div className="border border-b" key={i}>{v.name}</div>)}
				</section>
				<FilterArea allFilters={filters} />
			</div>
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