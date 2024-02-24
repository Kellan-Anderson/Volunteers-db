import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { verifyUser } from "~/lib/verifyUser";
import { getServerAuthSession } from "~/server/auth/auth";
import { api } from "~/trpc/server";
import { InviteButtons } from "./inviteButtons";

type JoinOrganizationPageProps = {
	params: { inviteCode: string }
}

export default async function JoinOrganizationPage({ params } : JoinOrganizationPageProps) {
	const invite = await api.invites.getInvite.query({ inviteCode: params.inviteCode })

	return (
		<div className="h-screen w-full flex justify-center items-center">
			<div className="w-5/12">
				{!invite ? <CodeDoesNotExist /> : <DecisionPrompt invite={invite} inviteCode={params.inviteCode} />}
			</div>
		</div>
	);
}

async function CodeDoesNotExist() {
	const session = await getServerAuthSession();
	return (
		<Card>
			<CardHeader>
				<CardTitle>Uh oh...</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					It looks like that code doesn&apos;t exist. If you think this is an issue please contact your system admin
				</CardDescription>
				<Button asChild>
					<Link href={session ? "/dashboard" : "/"}>
						{session ? 'Go to the dashboard' : 'Go to home page'}
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

type DecisionPromptProps = {
	inviteCode: string,
	invite: {
    name: string,
    organizationName: string,
    expired: boolean,
		adminInvite: boolean,
	}
}

async function DecisionPrompt({ inviteCode, invite } : DecisionPromptProps) {
	await verifyUser({ callbackUrl: `/join-organization/${inviteCode}` })
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					You have been invited to join {invite.organizationName} as a {invite.adminInvite ? 'admin' : 'user'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<InviteButtons inviteCode={inviteCode} />
			</CardContent>
		</Card>
	);
}