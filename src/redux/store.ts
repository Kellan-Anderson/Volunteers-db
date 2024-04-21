import { configureStore } from "@reduxjs/toolkit"
import filterSlice from "./reducers/filterSlice";
import filtersDialogSlice from "./reducers/filtersDialogReducer";

export const store = configureStore({
  reducer: {
    filters: filterSlice,
    filterDialog: filtersDialogSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;