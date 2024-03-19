'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	type SubmitHandler,
	type SubmitErrorHandler,
	useForm,
} from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { uploadFiles } from "~/lib/uploadthing";
import { api } from "~/trpc/react";
import {
	type FormAreaProps,
	type filterRow,
	volunteersParser,
} from "~/types";
import { Filters } from "./filters";
import { useAppSelector } from "~/redux/reduxHooks";

type VolunteerFormProps = {
	filters: filterRow[]
	admin?: boolean
}

export function AddVolunteersForm({ filters, admin=false } : VolunteerFormProps) {
	const [loading, setLoading] = useState(false);
	const [profilePicture, setProfilePicture] = useState<File | undefined>();

	const { categories, tags } = useAppSelector(state => state.filters)

	const router = useRouter();
	const { mutate } = api.volunteers.addVolunteer.useMutation({
		onSuccess: () => router.push('/dashboard'),
		onError: () => setLoading(false)
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

	const onAddVolunteerSubmit: SubmitHandler<z.infer<typeof volunteersParser>> = async (values) => {
		let profilePictureUrl: string | undefined = undefined;
		setLoading(true);
		if(profilePicture) {
			const uploadedFile = await uploadFiles('profilePictureUpload', { files: [profilePicture] })
			profilePictureUrl = uploadedFile.at(0)?.url;
		}
		mutate({
			...values,
			filters: [
				...tags.filter(t => t.selected),
				...categories.filter(c => c.selected)
			],
			profilePictureUrl
		});
	}

	const onAddVolunteerError: SubmitErrorHandler<z.infer<typeof volunteersParser>> = (values) => {
		console.error({values})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onAddVolunteerSubmit)} className="flex flex-col gap-0.5">
				<GeneralInfoArea control={form.control} />
				<div className="space-y-2">
					<Label>Profile Picture</Label>
					<Input
						type="file"
						onChange={(e) => setProfilePicture(e.target.files?.item(0) ?? undefined)}
						/>
				</div>
			</form>
			
			<h1 className="text-lg font-bold pt-6">Extras</h1>
			<Filters filters={filters} admin={admin} />
			
			<Button
				type="button"
				className="w-full mt-3"
				onClick={() => form.handleSubmit(onAddVolunteerSubmit, onAddVolunteerError)()}
			>
				{loading ? <Loader2 className="text-blue-500 animate-spin" /> : "Submit"}
			</Button>
		</Form>
	);
}

function GeneralInfoArea({ control } : FormAreaProps) {
	return (
		<>
			<FormField
				control={control}
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
				control={control}
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
				control={control}
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
				control={control}
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
		</>
	);
}