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
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import {
	type FormAreaProps,
	type filterRow,
	type editableVolunteer,
	volunteersParser,
} from "~/types";
import { Filters } from "./filters";
import { useAppSelector } from "~/redux/reduxHooks";
import { getEditableVolunteerObject } from "~/lib/getEditableVolunteerObject";
import { useProfilePicture } from "~/hooks/useProfilePicture";

type VolunteerFormProps = {
	filters: filterRow[]
	admin?: boolean,
	defaultVolunteer?: editableVolunteer
}

export function VolunteersForm({ filters, admin=false, defaultVolunteer } : VolunteerFormProps) {
	const [loading, setLoading] = useState(false);
	const { ProfilePicture, getPictureUrl } = useProfilePicture({
		defaultUrl: defaultVolunteer?.defaultValues.profilePictureUrl,
	})

	const { categories, tags } = useAppSelector(state => state.filters)

	const router = useRouter();
	const { mutate: addVolunteer } = api.volunteers.addVolunteer.useMutation({
		onSuccess: () => router.push('/dashboard'),
		onError: () => setLoading(false)
	});
	const { mutate: editVolunteer } = api.volunteers.editVolunteer.useMutation({
		onSuccess: () => router.push('/dashboard'),
		onError: () => setLoading(false)
	})

	const form = useForm<z.infer<typeof volunteersParser>>({
		defaultValues: getEditableVolunteerObject(defaultVolunteer),
		resolver: zodResolver(volunteersParser)
	});

	const onAddVolunteerSubmit: SubmitHandler<z.infer<typeof volunteersParser>> = async (values) => {
		const profilePictureUrl = await getPictureUrl();
		const volunteer = {
			...values,
			filters: [
				...tags.filter(t => t.selected),
				...categories.filter(c => c.selected)
			],
			profilePictureUrl: profilePictureUrl ?? undefined
		}

		if(defaultVolunteer) {
			editVolunteer({ ...volunteer, volunteerId: defaultVolunteer.defaultValues.id });
		} else {
			addVolunteer(volunteer)
		}
	}

	const onAddVolunteerError: SubmitErrorHandler<z.infer<typeof volunteersParser>> = (values) => {
		console.error({values})
	}

	return (
		<Form {...form}>
			<ProfilePicture />
			<form onSubmit={form.handleSubmit(onAddVolunteerSubmit)} className="flex flex-col gap-0.5">
				<GeneralInfoArea control={form.control} />
			</form>
			
			<h1 className="text-lg font-bold pt-6">Extras</h1>
			<Filters filters={filters} activeFilters={defaultVolunteer?.activeFilters} admin={admin} />
			
			<Button
				type="submit"
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