'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchFormParser = z.object({ query: z.string().min(1) });
  const form = useForm<z.infer<typeof searchFormParser>>({
    defaultValues: { query: '' },
    resolver: zodResolver(searchFormParser)
  });
  const querySubmit: SubmitHandler<z.infer<typeof searchFormParser>> = (values) => {
    console.log({values});
    router.push(`${pathname}?query=${values.query}`)
  }

  return (
    <div className="border border-y w-full flex flex-row justify-start items-center gap-1">
      <Search className="mx-1.5"/>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(querySubmit)} className="w-full">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="group flex flex-row w-full">
                <FormControl>
                  <Input
                    placeholder="Search by name"
                    className="peer border-none focus-visible:ring-0 rounded-none grow shadow-none"
                    {...field}
                  />
                </FormControl>
                <CornerDownLeft className="hidden peer-focus-visible:block justify-self-end mx-1.5"/>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}