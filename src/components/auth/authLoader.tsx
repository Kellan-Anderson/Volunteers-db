'use client'

import { useEffect } from "react"
import { setAuthState } from "~/redux/reducers/authSlice";
import { useAppDispatch } from "~/redux/reduxHooks"
import { api } from "~/trpc/react";

export function AuthLoader() {
  const authState = api.organizations.getCurrentOrganization.useQuery();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if(authState.data)
      dispatch(setAuthState(authState.data.permission))
  }, [authState.data, dispatch])
  return <></>
}