'use client'

import { ArrowDown, ArrowUp, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { type z } from "zod"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Toggle } from "~/components/ui/toggle"
import { useUrlState } from "~/hooks/useUrlState"
import { type filter, type filterRow, sortByParser } from "~/types"

type FilterAreaProps = {
  allFilters: filterRow[],
  isAdmin?: boolean
}

type FilterProps = {
  filters: filter[]
}

export function FilterArea(props: FilterAreaProps) {
  return (
    <>
      <div className="hidden lg:block">
        <Filters {...props} />
      </div>
      <Drawer>
        <DrawerTrigger asChild className="fixed bottom-2 right-2 lg:hidden">
          <Button className="rounded-full h-12 w-12 p-3">
            <SlidersHorizontal className="h-9 w-9"/>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="lg:hidden">
          <Filters {...props} />
        </DrawerContent>
      </Drawer>
    </>
  );
}

function Filters({ allFilters, isAdmin=false } : FilterAreaProps) {
  const params = useSearchParams();
  const sortByValue = sortByParser.safeParse(params.get('sortBy'))

  const categoryFilters: filter[] = allFilters
    .filter(f => f.filterType === 'category')
    .map(f => ({
      ...f,
      selected: params.has('filterBy', f.urlId)
    }));
  const tagFilters: filter[] = allFilters
    .filter(f => f.filterType === 'tag')
    .map(f => ({
      ...f,
      selected: params.has('filterBy', f.urlId)
    }));

  return (
    <div className="flex flex-col w-full lg:w-72 p-2 lg:m-2 lg:border rounded-xl">
      <h1 className="font-bold text-lg pb-3 pt-1 pl-1">Filter and sort</h1>
      <section id="sortBy">
        <Card>
          <CardHeader className="p-3">
            <CardTitle>Sort By</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3">
            <SortingSelector defaultValue={sortByValue.success ? sortByValue.data : undefined} />
          </CardContent>
        </Card>
      </section>
      <section id="categories" className="pt-2.5">
        <Card>
          <CardHeader className="p-3">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3">
            <CategoryFilters filters={categoryFilters} />
          </CardContent>
        </Card>
      </section>
      <section id="tags" className="pt-2.5">
        <Card>
          <CardHeader className="p-3">
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3">
            <TagFilters filters={tagFilters} />
          </CardContent>
        </Card>
      </section>
      {isAdmin && (
        <Button asChild variant="secondary" className="mt-2">
          <Link href="/filters">
            Edit filters
          </Link>
        </Button>
      )}
    </div>
  );
}

function CategoryFilters({ filters } : FilterProps) {
  const { pushItem: pushUrlItem, removeItem } = useUrlState('filterBy')
  return (
    <div className="flex flex-col gap-1">
      {filters.map(f => (
        <div className="flex flex-row gap-1.5" key={f.id}>
          <Checkbox
            id={f.id}
            defaultChecked={f.selected}
            onCheckedChange={(checked) => checked ? pushUrlItem(f.urlId) : removeItem(f.urlId)}
          />
          <Label htmlFor={f.id}>{f.name}</Label>
        </div>
      ))}
    </div>
  );
}

function TagFilters({ filters } : FilterProps) {
  const { pushItem: pushUrlItem, removeItem } = useUrlState('filterBy');
  const [tagQuery, setTagQuery] = useState('');
  const queriedFilters = tagQuery === '' 
    ? filters 
    : filters.filter(f => f.name.toLowerCase().startsWith(tagQuery.toLowerCase()));

  return (
    <div className="flex flex-col w-full">
      <Input
        value={tagQuery}
        onChange={e => setTagQuery(e.target.value)}
        placeholder="Search for tag"
      />
      <div className="flex flex-wrap gap-1.5 pt-2">
        {queriedFilters.map(f => (
          <Toggle
            key={f.id}
            defaultPressed={f.selected}
            onPressedChange={pressed => pressed ? pushUrlItem(f.urlId) : removeItem(f.urlId)}
            className="border"
          >
            {f.name}
          </Toggle>
        ))}
      </div>
    </div>
  );
}

type SortingSelectorProps = {
  defaultValue?: z.infer<typeof sortByParser>
}

function SortingSelector({ defaultValue='name-asc' } : SortingSelectorProps) {
  const { replaceItem } = useUrlState('sortBy');

  return (
    <Select defaultValue={defaultValue} onValueChange={(value) => replaceItem(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">
          <div className="flex flex-row gap-1 items-center">
            <ArrowDown className="h-4 w-4"/>
            Name
          </div>
        </SelectItem>
        <SelectItem value="name-desc">
          <div className="flex flex-row gap-1 items-center">
            <ArrowUp className="h-4 w-4" />
            Name
          </div>
        </SelectItem>
        <SelectItem value="created-at-asc">
          <div className="flex flex-row gap-1 items-center">
            <ArrowDown className="h-4 w-4" />
            Created At
          </div>
        </SelectItem>
        <SelectItem value="created-at-dec">
          <div className="flex flex-row gap-1 items-center">
            <ArrowUp className="h-4 w-4" />
            CreatedAt
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}