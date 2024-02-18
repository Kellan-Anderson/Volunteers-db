import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth/auth";

type VerifyUserProps = {
	verifyAdmin?: boolean,
	callbackUrl?: string
} & ({
	redirectOnSignedIn: true,
	redirectTo: string,
} | {
	redirectOnSignedIn?: false,
	redirectTo?: string,
})

const defaultRedirect = '/sign-in'

export async function VerifyUser(props?: VerifyUserProps) {
	const session = await getServerAuthSession();
	if(!session || props?.redirectOnSignedIn) {
		const url = (props?.redirectTo ?? defaultRedirect) + (props?.callbackUrl ? `?callbackUrl=${props.callbackUrl}` : '')
		redirect(url);
	}

	if(props?.verifyAdmin && session.user.role !== 'admin') {
		throw new Error('User is required to be an admin')
	}

	return session.user
}