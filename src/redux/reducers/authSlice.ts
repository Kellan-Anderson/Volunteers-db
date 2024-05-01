import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { organizationPermissions } from "~/types";

type authState = {
  loading: boolean,
  permission: organizationPermissions | ''
}

const initialState: authState = {
  loading: true,
  permission: ''
}

const authSlice = createSlice({
  initialState,
  name: 'authSlice',
  reducers: {
    setAuthState: (_state, action: PayloadAction<organizationPermissions>) => ({
      loading: false,
      permission: action.payload
    })
  }
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer