import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { SearchBar } from "./_dashboardComponents/searchBar";
import { FilterArea } from "./_dashboardComponents/filterArea";
import { sortByParser } from "~/types";
import { DeleteUserButton, EditUserButton } from "./_dashboardComponents/previewComponents";
import { AtSign, Phone, UserRound } from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import { VolunteerTable } from "./_dashboardComponents/volunteerTable";
import { unstable_noStore as noStore } from 'next/cache';
import { Refresher } from "./_dashboardComponents/refresher";
import { PreviewSheet } from "~/components/previewSheet";

dayjs.extend(relativeTime)

type DashboardPageProps = {
	searchParams: Record<string, string>
}

export default async function DashboardPage({ searchParams } : DashboardPageProps) {
	noStore();

	const searchQuery = [searchParams.query].flat().at(0);
	const urlFilters = [searchParams.filterBy ?? []].flat();
	const sortingOrder = [searchParams.sortBy].flat().at(0);
	const selectedVolunteerUrl = [searchParams.volunteer].flat().at(0);

	const verifiedSortingSelection = sortByParser.safeParse(sortingOrder);

	const { filters, permission } = await api.organizations.getCurrentOrganization.query();
	const volunteers = await api.volunteers.getVolunteers.query({
		query: searchQuery,
		filterUrlIds: urlFilters,
		sortBy: verifiedSortingSelection.success ? verifiedSortingSelection.data : undefined
	});

	return (
		<>
			<Refresher />
			<header className="flex flex-row justify-between items-center p-2 pl-14 lg:pl-2 border-b">
				<h1 className="font-bold text-lg">Volunteers</h1>
				<AddVolunteerButton />
			</header>
			<div className="p-2 pb-0">
				<SearchBar />
			</div>
			<div className="flex flex-row w-full">
				<section className="grow">
					<VolunteerTable volunteers={volunteers} />
				</section>
				<FilterArea allFilters={filters} isAdmin={permission === 'admin'} />
			</div>
			{selectedVolunteerUrl && <VolunteerInformation volunteerUrl={selectedVolunteerUrl} />}
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

type VolunteerInformationProps = {
	volunteerUrl: string
}

async function VolunteerInformation({ volunteerUrl } : VolunteerInformationProps) {
	const volunteer = await api.volunteers.getVolunteerInformation.query({ volunteerUrl })

	const tags = volunteer.activeFilters.filter(f => f.filterType === 'tag')
	const categories = volunteer.activeFilters.filter(f => f.filterType === 'category')

	return (
		<PreviewSheet itemUrl={volunteerUrl} urlKey="volunteer">
			<div className="flex flex-col">
				<header className="flex flex-row">
					<div className="h-20 w-20 bg-secondary/90 rounded-full overflow-hidden relative flex justify-center items-center">
						{volunteer.profilePictureUrl ? (
							<Image
								src={volunteer.profilePictureUrl}
								alt={`${volunteer.name} profile picture`}
								fill
							/>
						) : (
							<UserRound className="h-9 w-9"/>
						)}
					</div>
					<div className="flex flex-col justify-between pl-3 py-3">
						<h1 className="text-lg font-bold">{volunteer.name}</h1>
						<p>Added by {volunteer.createdBy.name} {dayjs(volunteer.createdAt).fromNow()}</p>
					</div>
				</header>
				<article className="pt-4">
					<p className="font-semibold">Details</p>
					<section className="flex flex-row gap-2 pt-2">
						<div className="flex flex-row items-center gap-1.5 font-medium">
							<AtSign className="p-0.5" />
							{volunteer.email}
						</div>
						{volunteer.phoneNumber && (
							<div className="flex flex-row gap-1.5 items-center font-medium">
								<Phone className="p-0.5" />
								{volunteer.phoneNumber}
							</div>
						)}
					</section>
					<section className="pt-4">
						<h1 className="font-semibold">Notes:</h1>
						<p>{(volunteer.notes && volunteer.notes !== '') ? volunteer.notes : "No notes..."}</p>
					</section>
					<section className="pt-4">
						<h1 className="font-semibold">Categories:</h1>
						{categories.length === 0 && <p>No Categories...</p>}
						<p className="font-medium">
							{categories.map(f => f.name).join(', ')}
						</p>
					</section>
					<section className="pt-4">
						<h1 className="font-semibold">Tags:</h1>
						<div className="flex flex-wrap gap-1.5 pt-1.5">
							{tags.length === 0 && <p>No Tags...</p>}
							{tags.map(f => (
								<Toggle pressed key={f.id}>
									{f.name}
								</Toggle>
								))
							}
						</div>
					</section>
				</article>
			</div>
			<div className="absolute top-10 right-4">
				<EditUserButton volunteerUrl={volunteerUrl} />
			</div>
			<div className="absolute top-16 right-4">
				<DeleteUserButton volunteerId={volunteer.id} volunteerUrl={volunteerUrl} />
			</div>
		</PreviewSheet>
	);
}