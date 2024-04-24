import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

type dialogContentState = "hidden" | "delete" | "change permission"

type organizationUserActionState = {
  action: dialogContentState,
  userId: string,
}

const initialState: organizationUserActionState = {
  action: 'hidden',
  userId: ''
}

const OrganizationUserActionSlice = createSlice({
  initialState,
  name: 'OrganizationUSerActionSlice',
  reducers: {
    openUserAction: (_state, action: PayloadAction<{action: 'delete' | 'change permission', userId: string}>) => {
      if(action.payload.userId === '') {
        console.error('Cannot open dialog without setting the user id');
        return {
          action: 'hidden',
          userId: ''
        }
      }
      return action.payload
    },
    closeUserAction: (_state) => ({
      action: 'hidden',
      userId: ''
    })
  }
});

export default OrganizationUserActionSlice.reducer;
export const { closeUserAction, openUserAction } = OrganizationUserActionSlice.actions;