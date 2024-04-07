import { VolunteersForm } from "../../_volunteerForm/volunteerForm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";
import type { editableVolunteer } from "~/types";

type EditVolunteerPageProps = {
  params: { volunteerUrl: string }
}

export default async function EditVolunteerPage({ params } : EditVolunteerPageProps) {
  const volunteer = await api.volunteers.getVolunteerInformation.query(params);
  const { filters, permission } = await api.organizations.getCurrentOrganization.query();

  const volunteerToEdit: editableVolunteer = {
    defaultValues: {
      name: volunteer.name,
      email: volunteer.email,
      phoneNumber: volunteer.phoneNumber,
      notes: volunteer.notes,
      profilePictureUrl: volunteer.profilePictureUrl,
      id: volunteer.id
    },
    activeFilters: volunteer.activeFilters
  }
  
  return (
    <div className="h-screen w-full flex justify-center overflow-auto py-3 px-12">
			<Card className="w-full md:w-2/3 lg:w-1/2 h-fit">
				<CardHeader>
					<CardTitle className="font-bold text-lg">Add a volunteer</CardTitle>
				</CardHeader>
				<CardContent>
					<VolunteersForm filters={filters} admin={permission === 'admin'} defaultVolunteer={volunteerToEdit} />
				</CardContent>
			</Card>
		</div>
  );
}