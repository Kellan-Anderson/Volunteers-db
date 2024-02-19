import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { verifyUser } from "~/lib/verifyUser";
import { OrganizationForm } from "./newOrganizationForm";

export default async function NewUserPage() {

	const user = await verifyUser();

	return (
		<div className="h-screen w-full flex justify-center items-center">
			<Card className="w-5/12">
				<CardHeader className="pb-2">
					<CardTitle>Create a New Organization</CardTitle>
					<CardDescription>This is the name of your new organization</CardDescription>
				</CardHeader>
				<CardContent>
					<OrganizationForm userId={user.id} />
				</CardContent>
			</Card>
		</div>
	);
}