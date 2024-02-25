import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { verifyUser } from "~/lib/verifyUser";
import { AddVolunteersForm } from "./addVolunteerForm";

export default async function AddVolunteerPage() {
	await verifyUser({ callbackUrl: '/add-volunteer' })

	return (
		<div className="h-screen w-full flex justify-center overflow-auto py-3">
			<Card className="w-1/2 h-fit">
				<CardHeader>
					<CardTitle>Add a volunteer</CardTitle>
				</CardHeader>
				<CardContent>
					<AddVolunteersForm />
				</CardContent>
			</Card>
		</div>
	);
}