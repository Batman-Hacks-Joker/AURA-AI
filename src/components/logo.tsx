import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/logo.png" 
        alt="AURA AI Logo" 
        width={140} 
        height={56} 
        className="dark:invert"
        />
    </div>
  );
}
