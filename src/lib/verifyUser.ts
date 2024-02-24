import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth/auth";

type VerifyUserProps = {
	callbackUrl?: string,
	verifyUserOrganization?: boolean
} & ({
	redirectOnSignedIn: true,
	redirectTo: string,
} | {
	redirectOnSignedIn?: false,
	redirectTo?: string,
})

const defaultRedirect = '/sign-in'

export async function verifyUser(props?: VerifyUserProps) {
	const userOrg = props?.verifyUserOrganization ?? false;
	const session = await getServerAuthSession();
	if(!session || props?.redirectOnSignedIn) {
		const url = (props?.redirectTo ?? defaultRedirect) + (props?.callbackUrl ? `?callbackUrl=${props.callbackUrl}` : '')
		redirect(url);
	}

	if(userOrg && session.user.lastOrganizationId === null) {
		redirect('/new-organization')
	}

	return session.user
}