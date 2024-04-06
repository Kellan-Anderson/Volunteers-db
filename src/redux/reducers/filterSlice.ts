import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { filter, filterRow } from "~/types";

type filterState = {
  categories: filter[],
  tags: filter[],
  loading: boolean
}

const initialState: filterState = {
  categories: [],
  tags: [],
  loading: true
};

const filterSlice = createSlice({
  initialState,
  name: 'filters',
  reducers: {
    setAddVolunteerFilters: (_, action: PayloadAction<{allFilters: filterRow[], activeFilters?: filterRow[]}>) => {
      const { allFilters, activeFilters } = action.payload;
      const categories: filter[] = [];
      const tags: filter[] = [];
      allFilters.forEach(filter => {
        const activeFilterIndex = activeFilters?.findIndex(f => f.id === filter.id);
        const selected = activeFilterIndex !== undefined && activeFilterIndex !== -1
        if(filter.filterType === 'category') {
          categories.push({ ...filter, selected })
        } else {
          tags.push({ ...filter, selected })
        }
      })
      return {
        categories,
        tags,
        loading: false
      };
    },

    toggleSelection: (state, action: PayloadAction<{id: string}>) => {
      const { id } = action.payload;
      const categories = state.categories.map(c => ({ ...c, selected: c.id === id ? !c.selected : c.selected }))
      const tags = state.tags.map(t => ({ ...t, selected: t.id === id ? !t.selected : t.selected }))
      return { ...state, categories, tags }
    },

    addCategory: (state, action: PayloadAction<filter>) => {
      state.categories.push(action.payload);
    },

    addTag: (state, action: PayloadAction<filter>) => {
      state.tags.push(action.payload)
    }
  }
})

export const { addCategory, addTag, setAddVolunteerFilters, toggleSelection } = filterSlice.actions;
export default filterSlice.reducer