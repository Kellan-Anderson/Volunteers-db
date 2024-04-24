import React from "react"
import { Navbar } from "./_navbarComponents/navbar"
import { api } from "~/trpc/server"
import { OrganizationDropdown } from "./_navbarComponents/organizationDropdown"
import { verifyUser } from "~/lib/verifyUser"
import { InviteUserButton } from "./_navbarComponents/inviteUserButton"
import { UserCard } from "./_navbarComponents/userCard"
import { SignOutButton } from "./_navbarComponents/signOutButton"

type ProtectedRoutesLayoutProps = {
	children: React.ReactNode
}

export default async function ProtectedRoutesLayout({ children } : ProtectedRoutesLayoutProps) {
	const user = await verifyUser({ callbackUrl: '/dashboard', verifyUserOrganization: true });
	const { organizations, permission } = await api.organizations.getUsersOrganizations.query();

	return (
		<div className="flex flex-row">
			<Navbar>
				<UserCard {...user} />
				<OrganizationDropdown organizationsList={organizations} usersLastOrganization={user.lastOrganizationId!} />
				<div className="pt-4 flex flex-col gap-2">
					{permission === 'admin' && <InviteUserButton />}
					<SignOutButton />
				</div>
			</Navbar>
			<div className="grow">
				{children}
			</div>
		</div>
	);
}