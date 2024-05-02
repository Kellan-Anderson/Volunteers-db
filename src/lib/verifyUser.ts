import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth/auth";
import { api } from "~/trpc/server";

type VerifyUserProps = {
	callbackUrl: string,
	verifyUserOrganization?: boolean,
	redirectOnSignedIn?: false,
	redirectTo?: string
}

const DEFAULT_REDIRECT = '/sign-in'

export async function legacyVerifyUser(props: VerifyUserProps) {
	const userOrg = props?.verifyUserOrganization ?? false;
	const session = await getServerAuthSession();
	if(!session || props?.redirectOnSignedIn) {
		const url = (props?.redirectTo ?? DEFAULT_REDIRECT) + (props?.callbackUrl ? `?callbackUrl=${props.callbackUrl}` : '')
		redirect(url);
	}

	if(userOrg && session.user.lastOrganizationId === null) {
		redirect('/new-organization')
	}

	return session.user
}

export async function verifyUser({ callbackUrl, redirectOnSignedIn, redirectTo } : VerifyUserProps) {
	const session = await getServerAuthSession();
	const callbackParams = new URLSearchParams();
	callbackParams.set('callback', callbackUrl);

	if(!session || redirectOnSignedIn) {
		redirect(`${redirectTo ?? DEFAULT_REDIRECT}?${callbackParams.toString()}`)
	}

	const { user } = session;
	if(!user.completedSetup) {
		redirect(`/new-organization?${callbackParams.toString()}`)
	}

	if(user.lastOrganizationId === null) {
		const { redirect: redirectUrl } = await api.users.resetLastOrganization.mutate();
		if(redirectUrl)
			redirect(redirectUrl)
	}

	return session.user
}