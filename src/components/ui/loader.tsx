import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <Loader2 className="animate-spin text-blue-500 h-6 w-6" />
    </div>
  );
}