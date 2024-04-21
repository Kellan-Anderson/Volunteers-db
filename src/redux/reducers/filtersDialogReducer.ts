import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { filtersWithDetails } from "~/types";

type filterDialogState = 'details' |'delete' | 'edit' | 'closed';
type reducerState = {
  dialogState: filterDialogState,
  filter?: filtersWithDetails
}

const initialState: reducerState = {
  dialogState: 'closed',
}

const filtersDialogSlice = createSlice({
  name: 'filterDialogSlice',
  initialState,
  reducers: {
    setFilterDialogOpenState: (state, action: PayloadAction<filterDialogState>) => ({
      ...state,
      dialogState: action.payload
    }),
    setFilterId: (state, action: PayloadAction<filtersWithDetails>) => ({
      ...state,
      filter: action.payload
    }),
    setFilterDialogState: (_state, action: PayloadAction<reducerState>) => action.payload
  }
});

export const { setFilterDialogOpenState, setFilterId, setFilterDialogState } = filtersDialogSlice.actions;
export default filtersDialogSlice.reducer