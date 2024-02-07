import { unstable_noStore as noStore } from "next/cache";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  noStore();

  const session = await getServerAuthSession();

  return (
    <>
      {session ? (
        <>User: {JSON.stringify(session.user)}</>
      ) : (
        <>No user</>
      )}
    </>
  );
}