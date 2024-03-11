import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { filter } from "~/types";

const initialState: filter[] = []

export const tagSlice = createSlice({
  initialState,
  name: "tagSlice",
  reducers: {
    setAllTags: (_state, action: PayloadAction<filter[]>) => {
      return action.payload;
    },
    toggleTag: (state, action: PayloadAction<{id: string}>) => {
      const { id } = action.payload;
      return state.map(tag => ({
        ...tag,
        selected: tag.id === id ? !tag.selected : tag.selected
      }))
    },
    addTag: (state, action: PayloadAction<filter>) => [...state, action.payload]
  }
});