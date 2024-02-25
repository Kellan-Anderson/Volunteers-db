'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { uploadFiles } from "~/lib/uploadthing";
import { api } from "~/trpc/react";

export function AddVolunteersForm() {

	const router = useRouter();
	const { mutate } = api.volunteers.addVolunteer.useMutation({
		onSuccess: () => router.push('/dashboard')
	})

	const volunteersParser = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
		phoneNumber: z.string().optional(),
		notes: z.string().optional(),
		profilePicture: z.instanceof(FileList).optional(),
	});

	const form = useForm<z.infer<typeof volunteersParser>>({
		defaultValues: {
			email: '',
			name: '',
			notes: '',
			phoneNumber: ''
		},
		resolver: zodResolver(volunteersParser)
	});

	const fileRef = form.register('profilePicture');

	const onAddVolunteerSubmit: SubmitHandler<z.infer<typeof volunteersParser>> = async (values) => {
		let profilePictureUrl: string | undefined = undefined;
		const uploadFile = values.profilePicture?.item(0);
		if(uploadFile) {
			const uploadedFile = await uploadFiles('profilePictureUpload', { files: [uploadFile] })
			profilePictureUrl = uploadedFile.at(0)?.url;
		}
		mutate({
			...values,
			profilePictureUrl
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onAddVolunteerSubmit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Volunteer name"
									{...field}
								/>
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
								<Input placeholder="Volunteer email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phoneNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone number</FormLabel>
							<FormControl>
								<Input placeholder="(555) 555-5555" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Notes</FormLabel>
							<FormControl>
								<Textarea placeholder="Notes about the volunteer" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="profilePicture"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Profile picture</FormLabel>
							<FormControl>
								<Input
									type="file"
									ref={fileRef.ref}
									name={fileRef.name}
									onBlur={fileRef.onBlur}
									onChange={(e) => field.onChange(e.target?.files?.[0] ?? undefined)}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="w-full mt-3"
				>
					Submit
				</Button>
			</form>
		</Form>
	);
}