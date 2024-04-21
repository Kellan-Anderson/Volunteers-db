import type { Control } from "react-hook-form"
import { z } from "zod"
import type { volunteers, filters } from "./server/db/schema"
import type { InferSelectModel } from "drizzle-orm"

/* ---------------------------------------------------- Types ------------------------------------------------------- */
export type filter = {
	id: string,
	name: string,
	urlId: string,
	selected: boolean
}

export type filterRow = InferSelectModel<typeof filters>;

export type volunteerRow = InferSelectModel<typeof volunteers>;

export type editableVolunteer = {
	defaultValues: {
		id: string,
		name: string,
		email: string,
		phoneNumber: string | null,
		notes: string | null,
		profilePictureUrl: string | null
	},
	activeFilters: filterRow[]
}

export type filtersWithDetails = {
	id: string,
	name: string,
	type: 'category' | 'tag',
	numVolunteers: number
}

/* ---------------------------------------------------- Props ------------------------------------------------------- */
export type FormAreaProps = {
	control: Control<z.infer<typeof volunteersParser>>
}

/* --------------------------------------------------- Parsers ------------------------------------------------------ */
export const volunteersParser = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
	phoneNumber: z.string().optional(),
	notes: z.string().optional()
});

export const filtersParser = z.object({
	id: z.string(),
	name: z.string(),
	urlId: z.string(),
	selected: z.boolean()
});

export const filtersList = filtersParser.array();

export const sortByParser = z.enum([ 'name-asc', 'name-desc', 'created-at-asc', 'created-at-desc' ]);