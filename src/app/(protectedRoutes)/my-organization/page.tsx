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

dayjs.extend(relativeTime)

type MyOrganizationPageProps = {
  searchParams: Record<string, string | string[]>
}

type UserInfoProps = {
  userId: string
}

export default async function MyOrganizationPage({ searchParams } : MyOrganizationPageProps) {

  await verifyUser({ callbackUrl: '/my-organization', verifyUserOrganization: true });
  const { users } = await api.organizations.getCurrentOrganization.query();

  const selectedUser = [searchParams.user].flat().at(0);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <OrganizationUsersTable users={users} />
      {selectedUser && <UserInfo userId={selectedUser} />}
    </div>
  );
}
;
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