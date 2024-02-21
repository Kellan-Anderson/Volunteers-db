'use client'

import { Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";

type OrganizationDropdownProps = {
	usersLastOrganization: string,
	organizationsList: {
		name: string,
		id: string,
	}[]
}

export function OrganizationDropdown({ organizationsList, usersLastOrganization } : OrganizationDropdownProps) {
	const router = useRouter();
	const { mutate: updateOrganization } = api.users.updateLastOrganization.useMutation({
		onSuccess: () => router.refresh()
	});

	return (
		<div className="flex flex-row gap-1">
			<Building className="h-9 w-9"/>
			<Select defaultValue={usersLastOrganization} onValueChange={(selection) => updateOrganization({ orgId: selection })}>
				<SelectTrigger>
					<SelectValue placeholder="Choose an organization"/>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{organizationsList.map(org => (
							<SelectItem value={org.id} key={org.id}>{org.name}</SelectItem>
						))}
						<SelectLabel
							className="hover:bg-accent font-bold cursor-pointer"
							onClick={() => router.push('/new-organization')}
						>
							Create a new organization
						</SelectLabel>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}