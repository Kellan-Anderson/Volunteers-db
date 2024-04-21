'use client'

import { Button } from "~/components/ui/button";
import { setFilterDialogOpenState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch } from "~/redux/reduxHooks";

export function AddFilterButton() {
  const dispatch = useAppDispatch();

  const onAddFilterClick = () => {
    dispatch(setFilterDialogOpenState('add'))
  }

  return (
    <Button onClick={onAddFilterClick}>Add Filter</Button>
  );
}