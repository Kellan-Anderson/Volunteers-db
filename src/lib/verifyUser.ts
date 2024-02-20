import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth/auth";

type VerifyUserProps = {
	verifyAdmin?: boolean,
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
	const session = await getServerAuthSession();
	if(!session || props?.redirectOnSignedIn) {
		const url = (props?.redirectTo ?? defaultRedirect) + (props?.callbackUrl ? `?callbackUrl=${props.callbackUrl}` : '')
		redirect(url);
	}

	if(session.user.lastOrganizationId === null) {
		redirect('/new-organization')
	}

	if(props?.verifyAdmin && session.user.role !== 'admin') {
		throw new Error('User is required to be an admin')
	}

	return session.user
}