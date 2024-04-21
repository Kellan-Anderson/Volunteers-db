import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

type filterDialogState = 'details' |'delete' | 'edit' | 'closed';
type reducerState = {
  dialogState: filterDialogState,
  id: string
}

const initialState: reducerState = {
  dialogState: 'closed',
  id: ''
}

const filtersDialogSlice = createSlice({
  name: 'filterDialogSlice',
  initialState,
  reducers: {
    setFilterDialogState: (state, action: PayloadAction<filterDialogState>) => ({
      ...state,
      dialogState: action.payload
    })
  }
});

export const { setFilterDialogState } = filtersDialogSlice.actions;
export default filtersDialogSlice.reducer