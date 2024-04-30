import { UserRound } from "lucide-react"
import Image from "next/image"
import type { PictureProps } from "~/types"

export function Picture({ image } : PictureProps) {
  if(typeof image === 'string' && image !== '') {
    return (
      <div className="h-full w-full rounded-full overflow-hidden relative">
        <Image src={image} alt="Profile picture" fill />
      </div>
    )
  }

  if(image !== undefined && typeof image === 'object' && image !== null) {
    return (
      <div className="h-full w-full rounded-full overflow-hidden relative">
        <Image src={URL.createObjectURL(image)} alt="Profile picture" fill />
      </div>
    )
  }

  return (
    <div className="h-full w-full rounded-full flex justify-center items-center bg-secondary/50">
      <UserRound className="h-8 w-8"/>
    </div>
  )
}