'use client'

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { setFilterDialogState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch } from "~/redux/reduxHooks";

type filterColumn = {
  name: string,
  type: 'category' | 'tag',
  numVolunteers: number
}

export const filterColumns: ColumnDef<filterColumn>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <>{row.original.type.split('').map((l, i) => i === 0 ? l.toUpperCase() : l)}</>
  },
  {
    accessorKey: 'numVolunteers',
    header: '# of volunteers',
    cell: ({ row }) => <div className="text-center">{row.getValue('numVolunteers')}</div>
  },
  {
    id: "actions",
    cell: ActionCell
  }
];


function ActionCell() {
  const dispatch = useAppDispatch();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => dispatch(setFilterDialogState('details'))}>View details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => dispatch(setFilterDialogState('edit'))}>Edit filter</DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(setFilterDialogState('delete'))}>Delete filter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}