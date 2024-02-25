import { verifyUser } from "~/lib/verifyUser";

export default async function AddVolunteerPage() {
	await verifyUser({ callbackUrl: '/add-volunteer' })
	
	return (
		<>This is the add volunteer page</>
	);
}