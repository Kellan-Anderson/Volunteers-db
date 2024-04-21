import { api } from "~/trpc/server";
import { DataTable } from "../../../components/ui/dataTable";
import { filterColumns } from "./_filtersComponents/table/columns";
import { FilterDialog } from "./_filtersComponents/table/filterDialog";

export default async function FiltersPage() {

  const filters = await api.filters.getAllFiltersWithDetails.query();

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <DataTable columns={filterColumns} data={filters} />
      <FilterDialog />
    </div>
  );
}