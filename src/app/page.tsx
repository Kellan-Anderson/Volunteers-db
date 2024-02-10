import { unstable_noStore as noStore } from "next/cache";
import { SignInWithGoogleButton } from "~/components/auth/signInButton";
import { getServerAuthSession } from "~/server/auth/auth";

export default async function Home() {
  noStore();

  const session = await getServerAuthSession();

  return (
    <>
      {session ? (
        <div className="flex flex-col">
          <div className="border border-black">
            Role: {session.user.role}
          </div>
        </div>
      ) : (
        <SignInWithGoogleButton />
      )}
    </>
  );
}