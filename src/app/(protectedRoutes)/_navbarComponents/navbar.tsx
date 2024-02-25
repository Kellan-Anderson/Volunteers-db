'use client'

import { Menu } from "lucide-react";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

type ChildrenProps = {
	children?: React.ReactNode
}

export function Navbar({ children } : ChildrenProps) {
	return (
		<>
      <div className="w-64 h-screen sticky top-0 hidden lg:block border-r p-2">
        {children}
      </div>
      <div className="lg:hidden absolute top-2 left-2">
        <Sheet>
          <SheetTrigger>
            <div className="p-1">
            	<Menu className="h-8 w-8"/>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="px-2">
						{children}
          </SheetContent>
        </Sheet>
      </div>
    </>
	);
}