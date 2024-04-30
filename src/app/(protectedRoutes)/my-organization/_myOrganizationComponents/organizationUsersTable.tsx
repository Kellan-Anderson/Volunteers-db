'use client'

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { DataTable } from "~/components/ui/dataTable"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useToast } from "~/components/ui/use-toast"
import { useUrlState } from "~/hooks/useUrlState"
import { closeUserAction, openUserAction } from "~/redux/reducers/organizationUserActionsSlice"
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks"
import { api } from "~/trpc/react"
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
      <DataTable columns={organizationUsersColumns} data={users} paginate />
      <OrganizationUserActionDialog />
    </>
  );
}

function OrganizationUserActionCell({ userId } : OrganizationUserActionCellProps) {
  const authState = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { pushItem } = useUrlState('user')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => pushItem(userId)}>
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
        {action === 'delete' && <DeleteUserContent />}
        {action === 'change permission' && <ChangePermissionContent />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserContent() {
  const { action, userId } = useAppSelector(state => state.organizationUserAction);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toaster = useToast();
  const { mutate, isLoading } = api.organizations.removeUser.useMutation({
    onSuccess: () => {
      router.refresh();
      dispatch(closeUserAction())
    },
    onError: (err) => toaster.toast({
      variant: "destructive",
      title: "There was an error",
      description: err.message
    })
  });

  if(action !== 'hidden' && userId === '') {
    dispatch(closeUserAction());
    console.error('Cannot remove user without user id')
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Are you sure you want to remove this user?</DialogTitle>
      </DialogHeader>
      <DialogDescription>This action cannot be undone</DialogDescription>
      <div className="flex flex-row gap-1.5 justify-between">
        <Button
          variant="secondary"
          className="grow"
          onClick={() => dispatch(closeUserAction())}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="grow"
          onClick={() => mutate({ userId })}
          disabled={isLoading}
        >
          Remove
        </Button>
      </div>
    </>
  );
}

function ChangePermissionContent() {
  const [permissionSelection, setPermissionSelection] = useState<'user' | 'admin'>('user');
  const [hasChanged, setHasChanged] = useState(false);
  const { action, userId } = useAppSelector(state => state.organizationUserAction);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toaster = useToast();
  const { mutate, isLoading } = api.organizations.changeUserPermission.useMutation({
    onSuccess: () => {
      router.refresh();
      dispatch(closeUserAction())
    },
    onError: (err) => toaster.toast({
      variant: "destructive",
      title: "There was an error",
      description: err.message
    })
  });

  if(action !== 'hidden' && userId === '') {
    dispatch(closeUserAction());
    console.error('Cannot remove user without user id')
  }

  const onSelectChange = (val: string) => {
    setHasChanged(true);
    if(val === 'user' || val === 'admin') {
      setPermissionSelection(val)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change user permission</DialogTitle>
      </DialogHeader>
      <DialogDescription>Update the users permission</DialogDescription>
      <div className="flex flex-row gap-1.5">
        <Select onValueChange={onSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a permission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
          disabled={!hasChanged || isLoading}
          onClick={() => mutate({ newPermission: permissionSelection, userId })}
          variant="secondary"
        >
          Update
        </Button>
      </div>
    </>
  );
}