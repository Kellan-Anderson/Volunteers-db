import type { Control } from "react-hook-form"
import { z } from "zod"
import { type filters } from "./server/db/schema"
import type { InferSelectModel } from "drizzle-orm"

/* ---------------------------------------------------- Types ------------------------------------------------------- */
export type filter = {
	id: string,
	name: string,
	urlId: string,
	selected: boolean
}

export type filterRow = InferSelectModel<typeof filters>

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
})