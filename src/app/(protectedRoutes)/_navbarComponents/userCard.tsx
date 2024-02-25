import Image from "next/image";

type UserCardProps = {
	name?: string | null | undefined,
  image?: string | null | undefined,
}

export function UserCard({ name, image } : UserCardProps) {
	return (
		<div className="p-2 flex flex-row gap-1.5 items-center">
			{image && (
				<div className="relative object-cover overflow-hidden rounded-lg h-12 w-12 flex justify-center">
					<Image src={image} alt={name ?? 'profile image'} fill />
				</div>
			)}
			<h1 className="font-bold text-xl">Hello{name && ` ${name}`}!</h1>
		</div>
	);
}