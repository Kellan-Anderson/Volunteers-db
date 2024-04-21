'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { setFilterDialogOpenState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks"
import { api } from "~/trpc/react";
import type { filtersWithDetails } from "~/types";

export function FilterDialog() {
  const { dialogState, filter } = useAppSelector(state => state.filterDialog);
  const dispatch = useAppDispatch();

  const onDialogOpenChange = (open: boolean) => {
    if(!open) dispatch(setFilterDialogOpenState('closed'))
  }

  const dialogOpen = filter?.id !== undefined && dialogState !== 'closed' 

  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        {dialogState === 'delete' && <DeleteFilterContent {...filter!} />}
        {dialogState === 'details' && <>Details</>}
        {dialogState === 'edit' && <EditFilterContent {...filter!} />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteFilterContent({ id, name, numVolunteers, type } : filtersWithDetails) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mutate } = api.filters.deleteFilter.useMutation({
    onSuccess: () => {
      dispatch(setFilterDialogOpenState('closed'))
      router.refresh()
    }
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Are you sure you want to delete {name}?</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        You will be removing this {type} from {numVolunteers} volunteers. This action cannot be undone 
      </DialogDescription>
      <div className="w-full flex justify-between gap-1.5">
        <Button
          onClick={() => dispatch(setFilterDialogOpenState('closed'))}
          variant="secondary"
          className="grow"
        >
          Cancel
        </Button>
        <Button
          onClick={() => mutate({ filterId: id })}
          variant="destructive"
          className="grow"
        >
          Delete
        </Button>
      </div>
    </>
  );
}

function EditFilterContent({ id, name } : filtersWithDetails) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mutate } = api.filters.editFilterName.useMutation({
    onSuccess: () => {
      dispatch(setFilterDialogOpenState('closed'))
      router.refresh()
    }
  })
  const filterParser = z.object({
    name: z.string().min(1, 'Name is required')
  });
  const form = useForm<z.infer<typeof filterParser>>({
    defaultValues: { name },
    resolver: zodResolver(filterParser)
  });
  const onEditSubmit: SubmitHandler<z.infer<typeof filterParser>> = (values) => {
    if(values.name !== name) {
      mutate({
        filterId: id,
        newName: values.name
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onEditSubmit)} className="flex flex-col">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2 w-fit place-self-end">Submit</Button>
      </form>
    </Form>
  );
}