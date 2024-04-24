'use client'

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "~/components/ui/button"
import { DataTable } from "~/components/ui/dataTable"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { closeUserAction, openUserAction } from "~/redux/reducers/organizationUserActionsSlice"
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks"
import type { userInfo } from "~/types"

type UsersTableProps = {
  users: userInfo[]
}

type OrganizationUserActionCellProps = {
  userId: string
}

export const organizationUsersColumns: ColumnDef<userInfo>[] = [
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
    cell: ({ row }) => {
      const name = row.original.name;
      if(!name) return <p className="text-muted-foreground">No name found</p>
      return <p>{name}</p>
    }
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
    accessorKey: 'permission',
    header: 'Permission',
    cell: ({ row: { original } }) => {
      const permission = original.permission;
      const capitalized = `${permission.slice(0,1).toUpperCase()}${permission.slice(1, permission.length)}`
      return <p>{capitalized}</p>
    }
  },
  {
    id: 'action',
    cell: ({ row }) => <OrganizationUserActionCell userId={row.original.id} />
  }
]

export function OrganizationUsersTable({ users } : UsersTableProps) {
  return (
    <>
      <DataTable columns={organizationUsersColumns} data={users} />
      <OrganizationUserActionDialog />
    </>
  );
}

function OrganizationUserActionCell({ userId } : OrganizationUserActionCellProps) {
  const authState = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          View details
        </DropdownMenuItem>
        {(authState.loading === false && authState.permission === 'admin') && (
          <>
            <DropdownMenuSeparator/>
            <DropdownMenuItem
              onClick={() => dispatch(openUserAction({ action: 'change permission', userId }))}
            >
              Change permission
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => dispatch(openUserAction({ action: 'delete', userId }))}
            >
              Remove user
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrganizationUserActionDialog() {
  const { action } = useAppSelector(state => state.organizationUserAction);
  const dispatch = useAppDispatch();

  const dialogOnOpenChange = (open: boolean) => {
    if(!open) {
      dispatch(closeUserAction())
    }
  }

  return (
    <Dialog open={action !== 'hidden'} onOpenChange={dialogOnOpenChange}>
      <DialogContent>
        {action === 'change permission' && <ChangePermissionContent />}
        {action === 'delete' && <DeleteUserContent />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserContent() {
  return (
    <>Delete user content</>
  );
}

function ChangePermissionContent() {
  return (
    <>Change permission content</>
  );
}