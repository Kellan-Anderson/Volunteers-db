'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Refresher() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, []);
  return <></>
}