import { verifyUser } from "~/lib/verifyUser";
import { OrganizationDropdown } from "../_navbarComponents/organizationDropdown";
import { api } from "~/trpc/server";

export default async function DashboardPage() {

	const user = await verifyUser({ callbackUrl: '/dashboard', verifyUserOrganization: true });
	const organizations = await api.organizations.getUsersOrganizations.query();

	return (
		<>
			<OrganizationDropdown organizationsList={organizations} usersLastOrganization={user.lastOrganizationId!} />
			{JSON.stringify(user)}
		</>
	);
}