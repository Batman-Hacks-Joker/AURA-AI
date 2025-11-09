import { cn } from "@/lib/utils";
import { Gem } from "lucide-react";

export function Logo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Gem className="h-7 w-7 text-primary" />
      {!collapsed && (
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
          AURA AI
        </h1>
      )}
    </div>
  );
}
