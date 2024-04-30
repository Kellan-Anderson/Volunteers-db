'use client'

import { type ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/dataTable";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Loader } from "~/components/ui/loader";
import { useUrlState } from "~/hooks/useUrlState";
import { useAppSelector } from "~/redux/reduxHooks";
import { api } from "~/trpc/react";
import type { volunteerRow } from "~/types"

/**
    name: string;
    email: string;
    phoneNumber: string | null;
    createdAt: Date;
 */

export const volunteerTableColumns: ColumnDef<volunteerRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="pl-0 text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="pl-0 text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone #'
  },
  {
    accessorKey: 'createdAt',
    header: 'Created on',
    cell: ({ row }) => <p>{dayjs(row.original.createdAt).format('MM/DD/YYYY')}</p>
  },
  {
    id: 'actions',
    cell: ({ row }) => VolunteerTableActionCell({...row.original})
  }
];

type VolunteerTableProps = {
  volunteers: volunteerRow[]
}

export function VolunteerTable({ volunteers } : VolunteerTableProps) {
  return (
    <div className="p-2 pb-0 md:pr-0 max-h-screen">
      <DataTable columns={volunteerTableColumns} data={volunteers} paginate />
    </div>
  );
}

type VolunteerTableActionCellProps = {
  id: string,
  url: string,
  name: string,
}

function VolunteerTableActionCell({ id, url, name } : VolunteerTableActionCellProps) {

  const auth = useAppSelector(state => state.auth);
  const { pushItem } = useUrlState('volunteer');
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { mutate, isLoading } = api.volunteers.deleteVolunteer.useMutation({
    onSuccess: () => {
      setDialogOpen(false);
      router.refresh();
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => pushItem(url)}>
            View details
          </DropdownMenuItem>
          {(auth.loading === false && auth.permission === 'admin') && (
            <>
              <DropdownMenuSeparator/>
              <DropdownMenuItem onClick={() => router.push(`/edit-volunteer/${url}`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setDialogOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete {name}?</DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <Button disabled>
              <Loader />
            </Button>
          ) : (
            <div className="flex flex-row gap-1 w-full">
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                className="grow"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="grow"
                onClick={() => mutate({ volunteerId: id })}
              >
                Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}