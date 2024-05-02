import { redirect } from "next/navigation";
import { verifyUser } from "~/lib/verifyUser";
import { api } from "~/trpc/server";
import { ChangeNameCard, DeleteCard } from "./_organizationSettingsComponents/organizationSettingsCard";

export default async function OrganizationSettingsPage() {
  await verifyUser({ callbackUrl: '/my-organization/settings' });
  const { permission, organizationName } = await api.organizations.getCurrentOrganization.query();
  
  if(permission !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-2/3 lg:w-4/5 p-12 flex flex-col gap-3 justify-center">
        <h1 className="font-bold text-xl">Settings</h1>
        <ChangeNameCard organizationName={organizationName} />
        <DeleteCard />
      </div>
    </div>
  );
}