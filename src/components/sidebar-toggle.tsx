"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useSidebar } from "./ui/sidebar"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function SidebarToggle() {
    const { state, toggleSidebar } = useSidebar()

    return (
        <Button
          variant="ghost"
          className={cn(
            "h-10 w-full justify-center transition-all",
            state === "expanded" ? "justify-end" : "justify-center"
          )}
          onClick={toggleSidebar}
        >
          {state === 'expanded' ? (
            <div className="flex items-center gap-2">
                <span className="text-sm">Collapse</span>
                <PanelLeftClose />
            </div>
          ) : (
            <PanelLeftOpen />
          )}
        </Button>
      )
}