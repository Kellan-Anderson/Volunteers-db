import { api } from "~/trpc/server";
import { DataTable } from "../../../components/ui/dataTable";
import { filterColumns } from "./_filtersComponents/columns";
import { FilterDialog } from "./_filtersComponents/filterDialog";
import { AddFilterButton } from "./_filtersComponents/addFilterButton";

export default async function FiltersPage() {

  const filters = await api.filters.getAllFiltersWithDetails.query();

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="w-full md:w-3/5 px-12 md:p-0">
        <div className="flex flex-row justify-between w-full py-2">
          <h1 className="text-2xl font-bold pb-2">Filters</h1>
          <AddFilterButton />
        </div>
        <DataTable columns={filterColumns} data={filters} />
      </div>
      <FilterDialog />
    </div>
  );
}