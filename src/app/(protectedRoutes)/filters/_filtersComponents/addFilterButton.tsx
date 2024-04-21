'use client'

import { Button } from "~/components/ui/button";
import { setFilterDialogOpenState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks";

export function AddFilterButton() {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const onAddFilterClick = () => {
    dispatch(setFilterDialogOpenState('add'))
  };

  if(auth.loading || auth.permission !== 'admin') return (
    <></>
  )

  return (
    <Button onClick={onAddFilterClick}>Add Filter</Button>
  );
}