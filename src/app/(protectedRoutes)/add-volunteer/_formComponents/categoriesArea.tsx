'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { capitalizeString } from "~/lib/capitalizeString";
import { api } from "~/trpc/react";
import type { FormAreaProps, category } from "~/types";

type CategoriesAreaProps = FormAreaProps & {
	admin?: boolean,
	categories: category[]
}

export function CategoriesArea({ admin=false, control, categories } : CategoriesAreaProps) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			<Card className="rounded-md">
				<CardHeader className="pb-1.5">
					<CardTitle>Categories</CardTitle>
				</CardHeader>
				<CardContent>
					<FormField
						control={control}
						name="categories"
						render={() => (
							<FormItem>
								<FormDescription>Assign categories to the volunteer</FormDescription>
								{categories.length === 0 && <p>No categories</p>}
								{categories.map(category => (
									<FormField
										control={control}
										name="categories"
										key={category.id}
										render={({ field }) => (
											<FormItem
												key={category.id}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(category.id)}
														onCheckedChange={(checked) => {
															return checked
																? field.onChange([...field.value, category.id])
																: field.onChange(
																		field.value?.filter(
																			(value) => value !== category.id
																		)
																	)
														}}
													/>
												</FormControl>
												<FormLabel>{capitalizeString(category.name)}</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</FormItem>
						)}
					/>
					{admin && (
						<div className="pt-2.5 w-full">
							<Button type="button" className="w-full" onClick={() => setDialogOpen(true)}>Add Category</Button>
						</div>
					)}
				</CardContent>
			</Card>
			<AddCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</>
	);
}

type AddCategoryDialogProps = {
	open: boolean,
	onOpenChange: (arg0: boolean) => void
}

function AddCategoryDialog({ onOpenChange, open } : AddCategoryDialogProps) {
	const router = useRouter();
	const { mutate } = api.categories.addCategory.useMutation({
		onSuccess: () => {
			onOpenChange(false);
			router.refresh();
		}
	})

	const addCategoryParser = z.object({
		name: z.string().min(1, 'Name is required')
	});

	const form = useForm<z.infer<typeof addCategoryParser>>({
		defaultValues: {
			name: ''
		},
		resolver: zodResolver(addCategoryParser)
	});

	const onAddCategorySubmit: SubmitHandler<z.infer<typeof addCategoryParser>> = (values) => {
		mutate(values)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a category</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onAddCategorySubmit)} className="flex flex-col gap-1.5">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field}/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="button" onClick={() => form.handleSubmit(onAddCategorySubmit)()}>Submit</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}