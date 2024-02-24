'use client'

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

type InviteButtonsProps = {
	inviteCode: string
}

export function InviteButtons({ inviteCode } : InviteButtonsProps) {
	const router = useRouter();
	const { mutate } = api.invites.makeDecision.useMutation({
		onSuccess: () => router.push('/dashboard')
	});
	return (
		<div className="flex flex-row justify-center w-full gap-1.5">
			<Button
				variant="destructive"
				onClick={() => mutate({ inviteCode, decision: 'deny' })}
				className="gap-1.5"
			>
				Deny{"  "}<X />
			</Button>
			<Button
				onClick={() => mutate({ inviteCode, decision: 'join' })}
				className="gap-1.5"
			>
				Join{"  "}<Check />
			</Button>
		</div>
	);
}