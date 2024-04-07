'use client'

import type { volunteerRow } from "~/types";
import Image from "next/image";
import { ChevronRight, Dot, Pencil, Trash, UserRound } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "~/components/ui/button";
import { useUrlState } from "~/hooks/useUrlState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Loader } from "~/components/ui/loader";

dayjs.extend(relativeTime);

type VolunteerRowProps = {
  admin?: boolean,
  volunteer: volunteerRow
}

export function VolunteerRow({ admin=false, volunteer } : VolunteerRowProps) {
  const { pushItem } = useUrlState('volunteer');
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate, isLoading } = api.volunteers.deleteVolunteer.useMutation({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      router.refresh();
    }
  });

  return (
    <>
      <div className="odd:bg-zinc-300/50 flex flex-row justify-between h-12 group">
        <div className="flex flex-row gap-1 items-center pl-2 cursor-pointer" onClick={() => pushItem(volunteer.url)}>
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-600 flex justify-center items-center">
            {volunteer.profilePictureUrl ? (
              <Image
              src={volunteer.profilePictureUrl}
              alt={`${volunteer.name} profile picture`}
              fill
              />
              ) : (
                <UserRound />
            )}
          </div>
          <div className="flex flex-col h-full pl-1.5">
            <p className="font-semibold">{volunteer.name}</p>
            <div className="flex flex-row">
              <p className="text-sm text-muted-foreground">{volunteer.email}</p>
              <Dot className="text-muted-foreground -mx-1" />
              <p className="text-sm text-muted-foreground">Created {dayjs(volunteer.createdAt).fromNow()}</p>
            </div>
          </div>
        </div>
        <CRUDButtons
          onMoreClick={() => pushItem(volunteer.url)}
          onEditClick={() => router.push(`/edit-volunteer/${volunteer.url}`)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          admin={admin}
        />
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete {volunteer.name}?</DialogTitle>
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
                onClick={() => setDeleteDialogOpen(false)}
                className="grow"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="grow"
                onClick={() => mutate({ volunteerId: volunteer.id })}
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

type CRUDButtonProps = {
  admin?: boolean,
  onDeleteClick?: () => void,
  onEditClick?: () => void,
  onMoreClick?: () => void
}

function CRUDButtons({ admin, onDeleteClick, onEditClick, onMoreClick } : CRUDButtonProps) {
  return (
    <div className="flex-row gap-1 items-center md:hidden md:group-hover:flex flex pr-2" id="crud-buttons">
      {admin && (
        <>
          <Button
            variant="ghost"
            className="p-2 h-9 w-9 group/button1"
            onClick={() => onDeleteClick?.()}
          >
            <Trash className="group-hover/button1:text-red-500 text-muted-foreground"/>
          </Button>
          <Button
            variant="ghost"
            className="p-2 h-9 w-9 group/button2"
            onClick={() => onEditClick?.()}
          >
            <Pencil className="group-hover/button2:text-green-500 text-muted-foreground"/>
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        className="p-2 h-9 w-9"
        onClick={() => onMoreClick?.()}
      >
        <ChevronRight className=" text-muted-foreground"/>
      </Button>
    </div>
  );
}