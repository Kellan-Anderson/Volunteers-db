'use client'

import { useEffect } from "react"
import { setAuthState } from "~/redux/reducers/authSlice";
import { useAppDispatch } from "~/redux/reduxHooks"
import { api } from "~/trpc/react";

export function AuthLoader() {
  const authState = api.organizations.getUsersOrganizations.useQuery();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if(authState.data) {
      const userCheck = authState.data;
      if(userCheck.userHasOrganization) {
        dispatch(setAuthState(userCheck.permission))
      }
    }
  }, [authState.data, dispatch])
  return <></>
}