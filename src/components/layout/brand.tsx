import { Factory } from "lucide-react";

export function Brand({ businessName }: { businessName: string }) {
  return (
    <div className="flex items-center gap-3 border-b px-5 py-4">
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Factory className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-tight">{businessName}</span>
        <span className="block text-xs text-muted-foreground">Manufacturing ERP</span>
      </span>
    </div>
  );
}
