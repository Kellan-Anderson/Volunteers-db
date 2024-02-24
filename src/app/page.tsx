import { unstable_noStore as noStore } from "next/cache";
import { SignInWithGoogleButton } from "~/components/auth/signInButton";
import { SignOutButton } from "~/components/auth/signOutButton";
import { getServerAuthSession } from "~/server/auth/auth";

export default async function Home() {
  noStore();

  const session = await getServerAuthSession();

  return (
    <>
      {session ? (
        <div className="flex flex-col">
          <SignOutButton />
        </div>
      ) : (
        <SignInWithGoogleButton />
      )}
    </>
  );
}

// TODO Add a form at the bottom of the home page for contacting the dev