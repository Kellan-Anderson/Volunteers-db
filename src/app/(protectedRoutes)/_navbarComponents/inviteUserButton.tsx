'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";

export function InviteUserButton() {
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	return (
		<>
			<Button
				onClick={() => setInviteDialogOpen(true)}
				className="w-full py-5 text-sm"
				variant="secondary"
			>
				Invite user to organization
			</Button>
			<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite user</DialogTitle>
					</DialogHeader>
					<InviteUserForm onSubmitSuccess={() => setInviteDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}

type InviteUserFormProps = {
	onSubmitSuccess?: () => void
}

function InviteUserForm({ onSubmitSuccess } : InviteUserFormProps) {
	const { mutate, isLoading } = api.invites.sendInvite.useMutation({
		onSuccess: onSubmitSuccess
	})
	const inviteUserParser = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
		makeAdmin: z.boolean().default(false),
	});
	const form = useForm<z.infer<typeof inviteUserParser>>({
		defaultValues: {
			email: '',
			makeAdmin: false,
			name: ''
		},
		resolver: zodResolver(inviteUserParser)
	});

	const onInviteSubmit: SubmitHandler<z.infer<typeof inviteUserParser>> = (values) => {
		mutate(values)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onInviteSubmit)} className="flex flex-col gap-1.5">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Name" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Email" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Accordion type="single" collapsible>
					<AccordionItem value="more-items">
						<AccordionTrigger className="pl-1">More options</AccordionTrigger>
						<AccordionContent>
							<FormField
								control={form.control}
								name="makeAdmin"
								render={({ field }) => (
									<FormItem className="flex flex-row gap-2 items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel>Make user an admin</FormLabel>
											<FormDescription>
												Selecting this will make the user you are inviting an admin. An admin has elevated permissions for
												the organization and can only be removed by the organization owner.
											</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				<Button type="submit" className="w-full mt-2">
					{isLoading ? <Loader2 className="animate-spin text-blue-500" /> : "Send invite"}
				</Button>
			</form>
		</Form>
	);
}