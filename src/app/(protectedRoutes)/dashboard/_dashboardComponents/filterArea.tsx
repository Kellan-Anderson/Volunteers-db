'use client'

import { useSearchParams } from "next/navigation"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
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
    <div className="flex flex-col w-72 p-2">
      <h1 className="font-bold text-lg">Filter and sort</h1>
      <section id="categories">
        <h1 className="py-1">Categories</h1>
        <CategoriesFilters filters={categoryFilters} />
      </section>
    </div>
  );
}

function CategoriesFilters({ filters } : FilterProps) {
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