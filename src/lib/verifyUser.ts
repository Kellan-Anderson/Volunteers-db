import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth/auth";

export async function verifyUser() {
	const headerList = headers();
	const url = headerList.get('referer');
	if(url !== '/') {
		const session = await getServerAuthSession();
		if(!session) {
			redirect('/sign-in')
		}
		return session.user
	}
}