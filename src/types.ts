import type { Control } from "react-hook-form"
import { z } from "zod"

/* ---------------------------------------------------- Types ------------------------------------------------------- */
export type filter = {
	id: string,
	name: string,
	urlId: string,
	selected: boolean
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
	notes: z.string().optional(),
	categories: z.array(z.string()),
	tags: z.string().array(),
});