'use client'

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export function SignOutButton() {

	const router = useRouter();
	const onSignOut = async () => {
		await signOut({ redirect: false });
		router.push('/')
	}

	return (
		<Button
			className="w-full py-5 text-sm"
			variant="secondary"
			onClick={onSignOut}
		>
			Sign Out
		</Button>
	);
}