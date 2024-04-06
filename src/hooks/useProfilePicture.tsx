import Image from "next/image"
import { FolderUp, Pencil, Trash, UserRound } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { useRef, useState } from "react"
import { uploadFiles } from "~/lib/uploadthing"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { api } from "~/trpc/react"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"

type PictureProps = {
  image?: string | File | null
}

type useProfilePictureProps = {
  defaultUrl: string | null | undefined
}

type dialogContentProps = {
  onOpenChange: (arg0: boolean) => void
}

type DeleteContentProps = {
  onDelete: () => void
}

type ChangeContentProps = {
  onChange: (arg0: File) => void
}


export function useProfilePicture({ defaultUrl } : useProfilePictureProps) {
  const [profilePicture, setProfilePicture] = useState<File>();
  const pictureAction = useRef<'no change' | 'delete' | 'change'>('no change');
  const [dialogOption, setDialogOption] = useState<'change' | 'delete' | undefined>();

  const { mutateAsync: deleteImage } = api.pictures.deleteProfilePicture.useMutation();

  const renderDeleteOption = (typeof defaultUrl === 'string' && defaultUrl !== '') || profilePicture;

  const onDeleteImage = () => {
    pictureAction.current = 'delete'
    setProfilePicture(undefined)
  }

  const onChangePicture = (f: File) => {
    pictureAction.current = 'change';
    setProfilePicture(f);
  }

  const onDialogChange = (open: boolean) => setDialogOption(open ? dialogOption : undefined)

  const getPictureUrl = async () => {
    if(pictureAction.current === 'no change') {
      return defaultUrl;
    }

    // if(typeof defaultUrl === 'string' && defaultUrl !== '') {

    //   await deleteImage({ profilePictureUrl: defaultUrl });

    //   if(pictureAction.current === 'delete') {
    //     return ''
    //   } else if(pictureAction.current === 'change' && profilePicture) {
    //     const filename = await uploadImage(profilePicture);
    //     return filename;
    //   }
    // }
    if(pictureAction.current === 'change') {
      if(profilePicture) {
        await deleteImage({ profilePictureUrl: defaultUrl })
        const filename = await uploadImage(profilePicture);
        return filename;
      }
    }

    if(pictureAction.current === 'delete') {
      await deleteImage({ profilePictureUrl: defaultUrl })
      return ''
    }

  }

  const ProfilePicture = () => {
    return (
      <>
        <div className="relative w-fit h-fit">
          {/* TODO need to change 'defaultUrl ?? undefined' to fallback to selected profile picture */}
          <Picture image={profilePicture ?? defaultUrl ?? undefined}/>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="absolute bottom-0 right-0 rounded-full p-1.5">
                <Pencil className="p-0.5"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDialogOption('change')}>
                <FolderUp />
                <p className="pl-1">Change profile picture</p>
              </DropdownMenuItem>
              {renderDeleteOption && (
                <DropdownMenuItem onClick={() => setDialogOption('delete')}>
                  <Trash />
                  <p className="pl-1">Delete profile picture</p>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Dialog
          open={dialogOption !== undefined}
          onOpenChange={onDialogChange}
        >
          <DialogContent>
            {dialogOption === 'delete' && (
              <DeleteContent onDelete={onDeleteImage} onOpenChange={onDialogChange} />
            )}
            {dialogOption === 'change' && (
              <ChangeContent image={defaultUrl} onChange={onChangePicture} onOpenChange={onDialogChange} />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return {
    ProfilePicture,
    getPictureUrl,
  }
}


function Picture({ image } : PictureProps) {
  if(typeof image === 'string' && image !== '') {
    return (
      <div className="h-36 w-36 rounded-full overflow-hidden relative">
        <Image src={image} alt="Profile picture" fill />
      </div>
    )
  }

  if(image !== undefined && typeof image === 'object' && image !== null) {
    return (
      <div className="h-36 w-36 rounded-full overflow-hidden relative">
        <Image src={URL.createObjectURL(image)} alt="Profile picture" fill />
      </div>
    )
  }

  return (
    <div className="h-36 w-36 rounded-full flex justify-center items-center bg-secondary/50">
      <UserRound className="h-8 w-8"/>
    </div>
  )
}

function DeleteContent({ onDelete, onOpenChange } : DeleteContentProps & dialogContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete profile picture?</DialogTitle>
        <DialogDescription>This action cannot be undone</DialogDescription>
      </DialogHeader>
      <div className="w-full flex flex-row justify-between gap-1">
        <Button 
          variant="secondary"
          className="grow"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          className="grow"
          onClick={() => {
            onDelete();
            onOpenChange(false);
          }}
        >
          Delete
        </Button>
      </div>
    </>
  );
}

function ChangeContent({ onChange, image, onOpenChange } : ChangeContentProps & dialogContentProps & PictureProps) {
  const [file, setFile] = useState<File>();

  const onFileChange = () => {
    if(file) {
      onChange(file)
    }
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change profile picture</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <div className="w-full flex flex-col justify-center items-center relative py-2">
          <Picture image={file ?? image} />
          <h1 className="pt-1 font-bold">Preview</h1>
        </div>
        <div className="px-4 flex flex-col gap-2.5">
          <Label htmlFor="file-input">Change file</Label>
          <Input
            type="file"
            id="file-input"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="file:text-primary"
          />
          <Button onClick={onFileChange} disabled={file === undefined}>Save</Button>
        </div>
      </div>
    </>
  );
}

async function uploadImage(input: File) {
  const uploadedFiles = await uploadFiles('profilePictureUpload', { files: [input] })
  return uploadedFiles.at(0)?.url
}