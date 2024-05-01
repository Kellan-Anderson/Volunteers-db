import { redirect } from "next/navigation";
import { verifyUser } from "~/lib/verifyUser";
import { api } from "~/trpc/server";

export default async function OrganizationSettingsPage() {
  await verifyUser({ redirectTo: '/my-organization/settings' });
  const { permission, organizationName } = await api.organizations.getCurrentOrganization.query();
  
  if(permission !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <>
      Settings
    </>
  );
}