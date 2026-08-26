import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A styled native `<select>`. Forms in this app post directly to server actions,
 * and a native control carries its value in FormData without client state.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentPropsWithoutRef<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
