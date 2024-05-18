import React from "react"
import { Navbar } from "./_navbarComponents/navbar"
import { OrganizationDropdown } from "../../components/organizationDropdown"
import { verifyUser } from "~/lib/verifyUser"
import { UserCard } from "./_navbarComponents/userCard"
import { SignOutButton } from "./_navbarComponents/signOutButton"
import { Button } from "~/components/ui/button"
import Link from "next/link"

type ProtectedRoutesLayoutProps = {
	children: React.ReactNode
}

export default async function ProtectedRoutesLayout({ children } : ProtectedRoutesLayoutProps) {
	const { user, organizations } = await verifyUser({ callbackUrl: '/dashboard', verifyUserOrganization: true });

	return (
		<div className="flex flex-row">
			<Navbar>
				<UserCard {...user} />
				<OrganizationDropdown organizationsList={organizations} usersLastOrganizationId={user.lastOrganizationId!} />
				<div className="pt-4 flex flex-col gap-2">
					<Button
						className="w-full py-5 text-sm"
						variant="secondary"
						asChild
					>
						<Link href="/my-organization">View my organization</Link>
					</Button>
					<Button
						className="w-full py-5 text-sm"
						variant="secondary"
						asChild
					>
						<Link href="/new-organization">Create new organization</Link>
					</Button>
					<Button
						className="w-full py-5 text-sm"
						variant="secondary"
						asChild
					>
						<Link href="/settings">Settings</Link>
					</Button>
					<SignOutButton />
				</div>
			</Navbar>
			<div className="grow">
				{children}
			</div>
		</div>
	);
}