import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "~/server/auth/auth";

const f = createUploadthing();

export const ourFileRouter = {
	profilePictureUpload: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
		.middleware(async () => {
			const session = await getServerAuthSession();
			if(!session) throw new UploadThingError('User is not signed in')
			return session.user
		})
		.onUploadComplete(({ file, metadata }) => {
			console.log(`${metadata.name} uploaded ${file.name}`);
			return { url: file.url }
		})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;