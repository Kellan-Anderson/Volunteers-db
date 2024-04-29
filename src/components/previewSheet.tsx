'use client'

import { useEffect, useState } from "react";
import { useUrlState } from "~/hooks/useUrlState";
import { Sheet, SheetContent } from "./ui/sheet";

type PreviewSheetProps = {
  itemUrl: string,
  urlKey: string,
  children?: React.ReactNode,
}

export function PreviewSheet({ itemUrl, children, urlKey } : PreviewSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { removeItem } = useUrlState(urlKey);

  useEffect(() => {
    setSheetOpen(true)
  }, [])

  const onClose = (open: boolean) => {
    if(!open) {
      setSheetOpen(false)
      removeItem(itemUrl)
    }
  }

  return (
    <Sheet onOpenChange={onClose} open={sheetOpen}>
      <SheetContent>
        {children}
      </SheetContent>
    </Sheet>
  );
}