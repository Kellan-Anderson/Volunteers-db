import { verifyUser } from "~/lib/verifyUser";
import { api } from "~/trpc/server";
import { OrganizationUsersTable } from "./_myOrganizationComponents/organizationUsersTable";

export default async function MyOrganizationPage() {

  await verifyUser({ callbackUrl: '/my-organization', verifyUserOrganization: true });
  const { users } = await api.organizations.getCurrentOrganization.query();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <OrganizationUsersTable users={users} />
    </div>
  );
}