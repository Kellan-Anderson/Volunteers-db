'use client'

import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "~/components/ui/button";
import { useUrlState } from "~/hooks/useUrlState";
import { api } from "~/trpc/react";

type EditUserButtonProps = {
  volunteerUrl: string
}

export function EditUserButton({ volunteerUrl } : EditUserButtonProps) {
  return (
    <Button
      variant="link"
      className="p-0 h-fit"
    >
      <Link href={`/edit-volunteer/${volunteerUrl}`}>
        <Pencil className="h-4 w-4 text-muted-foreground hover:text-red-500" />
      </Link>
    </Button>
  );
}

type DeleteUserButtonProps = {
  volunteerId: string,
  volunteerUrl: string,
}

export function DeleteUserButton({ volunteerId, volunteerUrl } : DeleteUserButtonProps) {
  const { removeItem } = useUrlState('volunteer')
  const router = useRouter();
  const { mutate } = api.volunteers.deleteVolunteer.useMutation({
    onSuccess: () => {
      removeItem(volunteerUrl)
      router.refresh();
    }
  });

  return (
    <Button
      variant="link"
      className="p-0 h-fit"
      onClick={() => mutate({ volunteerId })}
    >
      <Trash className="hover:text-red-500 text-muted-foreground h-4 w-4" />
    </Button>
  );
}