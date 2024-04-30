'use client'

import { DataTable } from "~/components/ui/dataTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ScrollArea } from "~/components/ui/scroll-area";

dayjs.extend(relativeTime);

type minimalVolunteerRow = {
  id: string,
  name: string,
  createdAt: Date,
  url: string
}

type UserInfoVolunteersTableProps = { volunteerRows: minimalVolunteerRow[] }

type WrapperProps = {
  length: number,
  children: React.ReactNode
}

export function UserInfoVolunteersTable({ volunteerRows } : UserInfoVolunteersTableProps) {

  const userInfoVolunteersTableColumns: ColumnDef<minimalVolunteerRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link href={`/dashboard?volunteer=${row.original.url}`} className="hover:underline">{row.original.name}</Link>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => <p>{dayjs(row.original.createdAt).fromNow()}</p>
    }
  ]

  return (
    <div className="mt-3">
      <ScrollWrapper length={volunteerRows.length}>
        <DataTable columns={userInfoVolunteersTableColumns} data={volunteerRows} />
      </ScrollWrapper>
    </div>
  );
}

function ScrollWrapper({ children, length } : WrapperProps) {
  if(length === 0) return <>{children}</>
  return (
    <ScrollArea className="h-[400px]">
      {children}
    </ScrollArea>    
  )
}
