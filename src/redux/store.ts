import { configureStore } from "@reduxjs/toolkit"
import filterSlice from "./reducers/filterSlice";

export const store = configureStore({
  reducer: {
    filters: filterSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;