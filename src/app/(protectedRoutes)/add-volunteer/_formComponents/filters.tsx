'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { type SubmitHandler, useForm } from "react-hook-form"
import { type FormEvent, useEffect, useState } from "react"
import { z } from "zod"
import { api } from "~/trpc/react"
import type { filterRow } from "~/types"

import { Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Loader } from "~/components/ui/loader"
import { Toggle } from "~/components/ui/toggle"

import { addCategory, addTag, setAddVolunteerFilters, toggleSelection } from "~/redux/reducers/filterSlice"
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks"


type filtersProps = {
  filters: filterRow[],
  admin?: boolean
}

export function Filters({ filters, admin=false } : filtersProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAddVolunteerFilters(filters))
  }, []);

  return (
    <Accordion type="multiple">
      <AccordionItem value="categories">
        <AccordionTrigger className="pl-px">Categories</AccordionTrigger>
        <AccordionContent className="p-1 pb-2.5">
          <CategoryFilters admin={admin} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="tags">
        <AccordionTrigger className="pl-px">Tags</AccordionTrigger>
        <AccordionContent className="p-1 pb-2.5">
          <TagFilters />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function TagFilters() {
  const { tags, loading } = useAppSelector(state => state.filters);
  const dispatch = useAppDispatch();
  const [tagQuery, setTagQuery] = useState('');

  const { mutate, isLoading } = api.filters.addFilter.useMutation({
    onSuccess: (filter) => {
      dispatch(addTag({...filter, selected: true}));
      setTagQuery('');
    },
  })

  const tagQuerySubmit = (e: FormEvent) => {
    e.preventDefault();
    const tagExists = tags.find(t => t.name.toLowerCase() === tagQuery.toLowerCase());
    if(!tagExists) {
      if(tagQuery !== '') {
        mutate({ filterType: 'tag', name: tagQuery })
      }
    } else {
      dispatch(toggleSelection({id: tagExists.id}));
      setTagQuery('');
    }
  }
  const toggleTag = (id: string) => {
    dispatch(toggleSelection({ id }))
  }

  const filteredTags = tagQuery === '' 
    ? tags 
    : tags.filter(t => t.name.toLowerCase().startsWith(tagQuery.toLowerCase()))

  return (
    <>
      <form onSubmit={tagQuerySubmit} className="flex flex-col gap-1.5">
        <Label htmlFor="tagQuery">Search for a tag</Label>
        <Input
          placeholder="Tag..."
          id="tagQuery"
          onChange={(e) => setTagQuery(e.target.value)}
          value={tagQuery}
          disabled={isLoading}
        />
        {tags.findIndex(t => t.name === tagQuery) === -1 && tagQuery !== '' && (
          <div className="flex flex-row gap-1">
            <p>Press enter to add tag</p>
            {isLoading && <Loader2 className="animate-spin text-blue-500 h-1 w-1" />}
          </div>
        )}
      </form>
      {loading && <Loader />}
      <div className="pt-2 flex flex-wrap gap-1.5">
        {filteredTags.map(t => (
          <Toggle
            key={t.id}
            pressed={t.selected}
            onPressedChange={() => toggleTag(t.id)}
            className="border"
          >
            {t.name}
          </Toggle>
        ))}
      </div>
    </>
  );
}

type CategoryFiltersProps = {
  admin?: boolean;
}

function CategoryFilters({ admin=false } : CategoryFiltersProps) {
  const { categories, loading } = useAppSelector(state => state.filters);
  const dispatch = useAppDispatch();
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);

  const form = useForm<{name: string}>({
    defaultValues: { name: '' },
    resolver: zodResolver(z.object({ name: z.string().min(1, 'Please enter a category name') }))
  });

  const { mutate, isLoading } = api.filters.addFilter.useMutation({
    onSuccess: (filter) => {
      dispatch(addCategory({ ...filter, selected: true }));
      setAddCategoryDialogOpen(false)
    },
    onError: (err) => form.setError('name', { type: 'custom', message: err.message })
  });

  const addCategorySubmit: SubmitHandler<{name: string }> = (values) => {
    const categoryExists = categories.find(cat => cat.name.toLowerCase() === values.name.toLowerCase());
    if(!categoryExists) {
      mutate({ filterType: 'category', name: values.name })
    } else {
      form.setError('name', {type: 'custom', message: 'That category already exists'})
    }
  }

  return (
    <>
      {loading && <Loader />}
      <div className="flex flex-col gap-2">
        {categories.map(c => (
          <div
            key={c.id}
            className="flex flex-row gap-1.5"
          >
            <Checkbox
              defaultChecked={c.selected}
              onCheckedChange={() => dispatch(toggleSelection({ id: c.id }))}
              id={c.id}
            />
            <Label htmlFor={c.id}>{c.name}</Label>
          </div>
        ))}
      </div>
      {admin && (
        <Button
          onClick={() => setAddCategoryDialogOpen(true)}
          variant="secondary"
          className="mt-3 w-full"
        >
          Add Category
        </Button>
      )}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(addCategorySubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <div className="flex flex-row gap-1.5">
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <Button type="submit">
                        {isLoading ? <Loader2 className="animate-spin text-blue-500" /> : "Submit"}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}