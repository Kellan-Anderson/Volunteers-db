import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

type permission = 'admin' | 'user'

type authState = {
  loading: boolean,
  permission: permission | ''
}

const initialState: authState = {
  loading: true,
  permission: ''
}

const authSlice = createSlice({
  initialState,
  name: 'authSlice',
  reducers: {
    setAuthState: (_state, action: PayloadAction<permission>) => ({
      loading: false,
      permission: action.payload
    })
  }
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer