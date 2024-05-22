import { Settings } from "lucide-react";
import { ChangeCurrentOrganizationCard, ChangeNameCard, DeleteAccountCard, LeaveOrganizationCard, ThemeSelectorCard } from "./_settingsComponents/actionCards";
import { verifyUser } from "~/lib/verifyUser";
import { BackButton } from "./_settingsComponents/backButton";

export const dynamic = 'force-dynamic'

export default async function UserSettingsPage() {

  const { user, organizations } = await verifyUser({ callbackUrl: '/settings' })

  return (
    <div className="w-full px-12 pt-4 lg:pt-12 flex flex-col justify-center gap-3">
      <div className="flex flex-row justify-between items-center">
        <h1 className="font-bold text-xl flex flex-row items-center gap-1">
          <Settings />
          Settings
        </h1>
        <BackButton />
      </div>
      <ChangeNameCard defaultName={user.name} />
      <ChangeCurrentOrganizationCard
        organizationsList={organizations}
        usersLastOrganizationId={user.lastOrganizationId}
      />
      <LeaveOrganizationCard organizationsList={organizations} />
      <DeleteAccountCard />
      <ThemeSelectorCard />
    </div>
  );
}