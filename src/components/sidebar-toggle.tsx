
"use client"

import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react"
import { useSidebar } from "./ui/sidebar"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function SidebarToggle() {
    const { toggleSidebar, state } = useSidebar()

    return (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={toggleSidebar}
        >
          {state === 'expanded' ? <ArrowLeftToLine /> : <ArrowRightToLine />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )
}
