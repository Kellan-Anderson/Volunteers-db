'use client'

import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type OrganizationFormProps = {
	userId: string
}

const organizationFormParser = z.object({
	organizationName: z.string().min(1, 'Organization name is required')
})

export function OrganizationForm({ userId } : OrganizationFormProps) {
	const form = useForm<z.infer<typeof organizationFormParser>>({
		defaultValues: {
			organizationName: ''
		},
		resolver: zodResolver(organizationFormParser)
	});

	const onFormSubmit: SubmitHandler<z.infer<typeof organizationFormParser>> = (values) => {
		console.log({values, userId})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFormSubmit)}>
				<FormField
					control={form.control}
					name="organizationName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Organization Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Name"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="mt-2 w-full"
				>
					Submit
				</Button>
			</form>
		</Form>
	);
}