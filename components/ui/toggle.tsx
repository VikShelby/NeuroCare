import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "@/lib/utils";

const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & { variant?: "default" | "outline" }
>(({ className, variant = "default", ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 px-2",
      variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      variant === "default" && "bg-muted hover:bg-muted/80",
      className
    )}
    {...props}
  />
));
Toggle.displayName = "Toggle";

export { Toggle };
