'use client'

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Toggle } from "~/components/ui/toggle"
import { useUrlState } from "~/hooks/useUrlState"
import type { filter, filterRow } from "~/types"

type FilterAreaProps = {
  allFilters: filterRow[],
}

type FilterProps = {
  filters: filter[]
}

export function FilterArea({ allFilters } : FilterAreaProps) {
  const params = useSearchParams();
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
    <div className="flex flex-col w-80 p-2">
      <h1 className="font-bold text-lg">Filter and sort</h1>
      <section id="categories">
        <h1 className="py-1">Categories</h1>
        <CategoryFilters filters={categoryFilters} />
      </section>
      <section id="tags">
        <h1 className="py-1">Tags</h1>
        <TagFilters filters={tagFilters} />
      </section>
    </div>
  );
}

function CategoryFilters({ filters } : FilterProps) {
  const { pushUrlItem, removeItem } = useUrlState('filterBy')
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
  const { pushUrlItem, removeItem } = useUrlState('filterBy');
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