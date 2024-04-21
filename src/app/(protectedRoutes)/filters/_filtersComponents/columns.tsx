'use client'

import type { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { setFilterDialogState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks";

type filterColumn = {
  name: string,
  type: 'category' | 'tag',
  numVolunteers: number,
  id: string
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
    header: () => <p className="text-center"># of volunteers</p>,
    cell: ({ row }) => <p className="text-center">{row.getValue('numVolunteers')}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => ActionCell({ row })
  }
];

type ActionCellProps = {
  row: Row<filterColumn>
}

function ActionCell({ row } : ActionCellProps) {
  const auth = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch();
  const onItemClick = (option: 'add' | 'edit' | 'delete') => {
    dispatch(setFilterDialogState({
      dialogState: option,
      filter: row.original
    }))
  }

  if(auth.loading || auth.permission !== 'admin') return (
    <></>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {row.original.type !== 'tag' && (
          <DropdownMenuItem onClick={() => onItemClick('edit')}>Edit {row.original.type}</DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onItemClick('delete')}
          className="text-red-500"
        >
          Delete {row.original.type}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}