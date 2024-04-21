'use client'

import { Dialog, DialogContent } from "~/components/ui/dialog";
import { setFilterDialogState } from "~/redux/reducers/filtersDialogReducer";
import { useAppDispatch, useAppSelector } from "~/redux/reduxHooks"

export function FilterDialog() {
  const { dialogState } = useAppSelector(state => state.filterDialog);
  const dispatch = useAppDispatch();

  const onDialogOpenChange = (open: boolean) => {
    if(!open) dispatch(setFilterDialogState('closed'))
  }

  return (
    <Dialog open={dialogState !== 'closed'} onOpenChange={onDialogOpenChange}>
      <DialogContent>
        {dialogState === 'delete' && (
          <>Delete</>
        )}
        {dialogState === 'details' && (
          <>Details</>
        )}
        {dialogState === 'edit' && (
          <>Edit</>
        )}
      </DialogContent>
    </Dialog>
  );
}