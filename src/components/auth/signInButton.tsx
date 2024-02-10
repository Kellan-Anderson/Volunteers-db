'use client'

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import Image from "next/image";

type SignInWithGoogleButtonProps = {
	redirectTo?: string
}

export function SignInWithGoogleButton({ redirectTo } : SignInWithGoogleButtonProps) {
	
	return (
		<Button
			className="bg-white text-black w-[268px] h-fit"
			onClick={async () => await signIn('google', { callbackUrl: redirectTo })}
		>
			<div className="flex flex-row w-full justify-center items-center p-3">
				<Image
					height={24}
					width={24}
					src='https://authjs.dev/img/providers/google.svg'
					alt="Google logo"
				/>
				<span className="grow text-base">Sign in with Google</span>
			</div>
		</Button>
	);
}