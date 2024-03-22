import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { SearchBar } from "./_dashboardComponents/searchBar";
import { FilterArea } from "./_dashboardComponents/filterArea";
import { sortByParser } from "~/types";
import { VolunteerRow } from "./_dashboardComponents/volunteerRow";

type DashboardPageProps = {
	searchParams: Record<string, string>
}

export default async function DashboardPage({ searchParams } : DashboardPageProps) {
	const searchQuery = [searchParams.query].flat().at(0);
	const urlFilters = [searchParams.filterBy ?? []].flat();
	const sortingOrder = [searchParams.sortBy].flat().at(0);

	const verifiedSortingSelection = sortByParser.safeParse(sortingOrder);

	const { filters, permission } = await api.organizations.getCurrentOrganization.query();
	const volunteers = await api.volunteers.getVolunteers.query({
		query: searchQuery,
		filterUrlIds: urlFilters,
		sortBy: verifiedSortingSelection.success ? verifiedSortingSelection.data : undefined
	});

	return (
		<>
			<header className="flex flex-row justify-between items-center p-2 pl-14 lg:pl-2 border-b">
				<h1 className="font-bold text-lg">Volunteers</h1>
				<AddVolunteerButton />
			</header>
			<SearchBar />
			<div className="flex flex-row w-full">
				<section className="grow">
					{volunteers.map((v, i) => <VolunteerRow admin={permission === 'admin'} volunteer={v} key={i}/>)}
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