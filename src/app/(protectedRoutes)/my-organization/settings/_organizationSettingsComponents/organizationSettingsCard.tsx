'use client'

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { Button } from "~/components/ui/button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

type ChangeNameCardProps = {
  organizationName: string
}

export function DeleteCard() {
  const router = useRouter();
  const { mutate } = api.organizations.deleteOrganization.useMutation({
    onSuccess: ({ redirect }) => {
      router.push(redirect ?? '/dashboard')
    }
  });

  return (
    <Card className="border-red-500">
      <CardHeader className="flex flex-row justify-between items-center py-3 space-y-0">
        <CardTitle className="h-fit">Delete organization</CardTitle>
        <Dialog>
          <Button variant="destructive" asChild>
            <DialogTrigger>Delete</DialogTrigger>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone and affects all of the users in your organization
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row gap-1">
              <Button variant="secondary" asChild className="grow">
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button variant="destructive" onClick={() => mutate()} className="grow">Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
    </Card>  
  );
}

export function ChangeNameCard({ organizationName } : ChangeNameCardProps) {
  const changeNameParser = z.object({
    name: z.string().min(1, 'Name is required')
  });
  const form = useForm<z.infer<typeof changeNameParser>>({
    defaultValues: {
      name: organizationName
    },
    resolver: zodResolver(changeNameParser)
  });
  const toaster = useToast();
  const router = useRouter();
  const { mutate, isLoading } = api.organizations.changeOrganizationName.useMutation({
    onSuccess: () => {
      router.refresh();
      toaster.toast({
        title: 'Name changed successfully'
      })
    }
  });

  const onChangeNameFormSubmit: SubmitHandler<z.infer<typeof changeNameParser>> = (values) => {
    mutate({ newName: values.name });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Change organization name</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-row gap-2 items-end w-full"
            onSubmit={form.handleSubmit(onChangeNameFormSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>Change</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}