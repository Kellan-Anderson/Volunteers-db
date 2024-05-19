import { verifyUser } from "~/lib/verifyUser";
import { api } from "~/trpc/server";
import { OrganizationUsersTable } from "./_myOrganizationComponents/organizationUsersTable";
import { PreviewSheet } from "~/components/previewSheet";
import { Picture } from "~/components/profilePicture";
import { Dot } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserInfoVolunteersTable } from "./_myOrganizationComponents/userInfoVolunteerTable";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { InviteUserButton } from "./_myOrganizationComponents/inviteUsersButton";

dayjs.extend(relativeTime)

type MyOrganizationPageProps = {
  searchParams: Record<string, string | string[]>
}

type UserInfoProps = {
  userId: string
}

type CountCardProps = {
  count: number,
  children: string
}

export default async function MyOrganizationPage({ searchParams } : MyOrganizationPageProps) {

  await verifyUser({ callbackUrl: '/my-organization', verifyUserOrganization: true });
  const { users, organizationName, volunteers, filters, permission } = await api.organizations.getCurrentOrganization.query();

  const selectedUser = [searchParams.user].flat().at(0);

  const volunteerCount = volunteers.length;
  const usersCount = users.length;
  const filtersCount = filters.length;

  return (
    <div className="w-full max-h-screen p-3 pt-2">
      <div className="flex flex-row justify-between items-center pb-2 pt-1 relative ml-10 lg:ml-0">
        <h1 className="font-bold text-xl h-fit">{organizationName} details</h1>
        {permission === 'owner' && (
          <Button asChild className="-mb-2">
            <Link href="/my-organization/settings">Go to settings</Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col">
        <p className="font-semibold pb-1 pl-1">Stats:</p>
        <div className="flex flex-row gap-2 w-full pb-2">
          <CountCard count={volunteerCount}>Volunteers</CountCard>
          <CountCard count={usersCount}>Users</CountCard>
          <CountCard count={filtersCount}>Filters</CountCard>
        </div>
        <div className="flex flex-row justify-between items-center w-full py-2 pl-1">
          <p className="font-semibold">Users:</p>
          {permission !== 'user' && <InviteUserButton />}
        </div>
        <OrganizationUsersTable users={users} />
      </div>
      {selectedUser && <UserInfo userId={selectedUser} />}
    </div>
  );
}

async function UserInfo({ userId } : UserInfoProps) {

  const userInfo = await api.organizations.getUser.query({ userId });

  return (
    <PreviewSheet itemUrl={userId} urlKey="user">
      <div className="flex flex-col">
				<header className="flex flex-row items-center">
          <div className="h-24 w-24">
					  <Picture image={userInfo.image} />
          </div>
					<div className="flex flex-col gap-1.5 pl-4 py-3">
						<h1 className="text-lg font-bold">{userInfo.name}</h1>
            <div className="text-sm text-muted-foreground flex flex-row">{userInfo.email}<Dot/>{userInfo.permission}</div>
					</div>
				</header>
				<article className="pt-4">
					<h2 className="font-semibold text-lg">Volunteers</h2>
					<p className="text-sm text-muted-foreground">Volunteers that {userInfo.name} has added</p>
          <UserInfoVolunteersTable volunteerRows={userInfo.volunteers} />
          <div className="w-full flex justify-center items-center pt-3">
            <Button asChild variant="secondary">
              <Link href="/dashboard">
                See all volunteers on dashboard
              </Link>
            </Button>
          </div>
				</article>
			</div>
    </PreviewSheet>
  );
}

function CountCard({ children, count } : CountCardProps) {
  return (
    <Card className="rounded-md p-4 flex flex-col w-1/3">
      <h3 className="text-xl font-semibold text-center">{count}</h3>
      <p className="text-center">{children}</p>
    </Card>
  );
}