import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { verifyUser } from "~/lib/verifyUser";
import { AddVolunteersForm } from "./_formComponents/addVolunteerForm";
import { api } from "~/trpc/server";

export default async function AddVolunteerPage() {
	await verifyUser({ callbackUrl: '/add-volunteer' });
	const { filters, permission } = await api.organizations.getCurrentOrganization.query();

	return (
		<div className="h-screen w-full flex justify-center overflow-auto py-3">
			<Card className="w-1/2 h-fit">
				<CardHeader>
					<CardTitle className="font-bold text-lg">Add a volunteer</CardTitle>
				</CardHeader>
				<CardContent>
					<AddVolunteersForm filters={filters} admin={permission === 'admin'} />
				</CardContent>
			</Card>
		</div>
	);
}