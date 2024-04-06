import type { editableVolunteer } from "~/types";

/**
 * Creates an object for react hook form default values based on the presence of a volunteer
 * @param volunteer 
 * @returns 
 */

export function getEditableVolunteerObject(volunteer: editableVolunteer | undefined) {
  return {
    name: volunteer?.defaultValues.name ?? '',
    email: volunteer?.defaultValues.email ?? '',
    phoneNumber: volunteer?.defaultValues.phoneNumber ?? '',
    notes: volunteer?.defaultValues.notes ?? '',
  }
}