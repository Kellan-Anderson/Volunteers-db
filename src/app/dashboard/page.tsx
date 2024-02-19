import { verifyUser } from "~/lib/verifyUser";

export default async function DashboardPage() {

	const user = await verifyUser({ callbackUrl: '/dashboard' });

	return (
		<>
			This is the dashboard
			user: {JSON.stringify(user)}
		</>
	);
}