'use client'

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button";

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      variant="link"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-5 w-5 mr-3"/>
      Back
    </Button>
  )
}