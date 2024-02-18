import { VerifyUser } from "~/lib/verifyUser";

export default async function DashboardPage() {

	const user = await VerifyUser({ callbackUrl: '/dashboard' });

	return (
		<>This is the dashboard</>
	);
}