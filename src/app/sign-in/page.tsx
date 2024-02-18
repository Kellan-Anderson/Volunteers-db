import { redirect } from "next/navigation";
import { SignInWithGoogleButton } from "~/components/auth/signInButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getServerAuthSession } from "~/server/auth/auth";

type SignInPageProps = {
	searchParams: Record<string, string | string[]>
}


export default async function SignInPage({ searchParams } : SignInPageProps) {
	const session = await getServerAuthSession();
	const redirectUrl = [searchParams.callbackUrl].flat().at(0);
	if(session && redirectUrl) {
		redirect(redirectUrl)
	}

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<Card className="py-2 px-0 w-5/12 flex flex-col justify-center items-center">
				<CardHeader>
					<CardTitle className="font-semibold text-lg text-center">Sign in</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="w-full flex justify-center items-center pb-2">
						<SignInWithGoogleButton redirectTo={redirectUrl} />
					</div>
					<Accordion type="single" collapsible>
						<AccordionItem value="more-info">
							<AccordionTrigger className="w-full text-center justify-center gap-1.5">
								Why we don&apos;t collect passwords
							</AccordionTrigger>
							<AccordionContent>
								We do not like passwords because they cause more trouble than they are worth; instead, we use providers
								like Google sign in. This helps us to keep your passwords more secure by not storing them and makes the
								sign in flow a little easier. Plus, who wants to remember another password?
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>
		</div>
	);
}