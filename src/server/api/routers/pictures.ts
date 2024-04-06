import { utapi } from "~/server/uploadthing";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const picturesRouter = createTRPCRouter({
  // TODO delete procedure
  updateProfilePicture: protectedProcedure
    .input(z.object({
      oldProfilePictureUrl: z.string(),
      volunteerId: z.string()
    }))
    .mutation(async ({ input }) => {
      const filePath = input.oldProfilePictureUrl.split('/')
      const filename = filePath.at(filePath.length - 1);
      if(!filename) throw new Error('There was an error getting the filename of the previous image')
      
      await utapi.deleteFiles(filename);
    }),

  deleteProfilePicture: protectedProcedure
    .input(z.object({
      profilePictureUrl: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { profilePictureUrl } = input;
      if(typeof profilePictureUrl === 'string') {
        const filePath = profilePictureUrl.split('/')
        const filename = filePath.at(-1);
        if(!filename) throw new Error('There was an error getting the filename of the previous image')
        
        await utapi.deleteFiles(filename);
      }
    })
})