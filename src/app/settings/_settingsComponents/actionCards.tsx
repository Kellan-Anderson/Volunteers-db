'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { OrganizationDropdown } from "~/components/organizationDropdown";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";

type ChangeNameCardProps = {
  defaultName: string | null | undefined
}

type ChangeCurrentOrganizationCardProps = {
  usersLastOrganizationId: string | null,
	organizationsList: {
		name: string,
		id: string,
	}[]
}

type LeaveOrganizationCardProps = {
  organizationsList: {
		name: string,
		id: string,
	}[]
}


export function ChangeNameCard({ defaultName } : ChangeNameCardProps) {
  const nameChangeFormParser = z.object({
    name: z.string().min(1, 'Name is required')
  });
  const router = useRouter();
  const { mutate, isLoading } = api.users.changeName.useMutation({
    onSuccess: () => router.refresh()
  })
  const form = useForm<z.infer<typeof nameChangeFormParser>>({
    defaultValues: {
      name: defaultName ?? ''
    },
    resolver: zodResolver(nameChangeFormParser)
  });
  const onNameChangeFormSubmit: SubmitHandler<z.infer<typeof nameChangeFormParser>> = (values) => {
    mutate({ newName: values.name})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change display name</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNameChangeFormSubmit)} className="flex flex-row items-end gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
            >
              Submit
            </Button>
          </form>
        </Form>      
      </CardContent>
    </Card>
  );
}

export function ChangeCurrentOrganizationCard({ organizationsList, usersLastOrganizationId } : ChangeCurrentOrganizationCardProps) {
  if(!usersLastOrganizationId)
    return <></>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change current organization</CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationDropdown organizationsList={organizationsList} usersLastOrganizationId={usersLastOrganizationId} />
      </CardContent>
    </Card>
  );
}

export function LeaveOrganizationCard({ organizationsList } : LeaveOrganizationCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const deleteFormSchema = z.object({
    id: z.string({ required_error: 'Please make a selection' })
  });
  const router = useRouter();
  const { mutate } = api.organizations.leaveOrganization.useMutation({
    onSuccess: () => {
      router.refresh()
      setDialogOpen(false);
    }
  })
  const form = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema)
  });
  const onDeleteFormSubmit: SubmitHandler<z.infer<typeof deleteFormSchema>> = (values) => {
    mutate({ organizationId: values.id })
  }

  return (
    <Card className="border-red-500">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="h-fit">Leave an organization</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Choose an organization</Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-1.5">
            <DialogHeader>
              <DialogTitle>Choose an organization</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onDeleteFormSubmit)}>
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select an organization</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizationsList.map(org => <SelectItem value={org.id} key={org.id}>{org.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        WARNING: This action has irreversible effects. Volunteers that you have added to this 
                        organization will not be deleted, but you will not be credited for them should you re-join this 
                        organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full mt-2"
                  variant="destructive"
                >
                  Leave organization
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
    </Card>
  );
}

export function DeleteAccountCard() {
  const router = useRouter();
  const { mutate } = api.users.deleteAccount.useMutation({
    onSuccess: () => router.push('/')
  });

  return (
    <Card className="border-red-500">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Delete Account</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              WARNING: This action is irreversible and you will be removed from all organizations you are a part of. Any 
              organizations you have created will be deleted and all data in that organization will be lost.
            </DialogDescription>
            <div className="flex flex-col gap-1.5">
              <Button variant="destructive" className="w-full" onClick={() => mutate()}>Delete Account</Button>
              <DialogClose className="w-full" asChild>
                <Button variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
    </Card>
  );
}

export function ThemeSelectorCard() {
  return (
    <Card>
      <CardContent>
        Coming soon...
      </CardContent>
    </Card>
  );
}