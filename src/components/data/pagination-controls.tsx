import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/query/pagination";

function hrefForPage(searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");

  const query = params.toString();
  return query ? `?${query}` : "?";
}

export function PaginationControls({
  meta,
  searchParams,
  label,
}: {
  meta: PageMeta;
  searchParams: Record<string, string | undefined>;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {meta.total === 0
          ? `No ${label} found`
          : `Showing ${meta.from}–${meta.to} of ${meta.total} ${label}`}
      </p>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={meta.page <= 1}>
          <Link
            href={hrefForPage(searchParams, meta.page - 1)}
            aria-disabled={meta.page <= 1}
            className={meta.page <= 1 ? "pointer-events-none opacity-50" : undefined}
            scroll={false}
          >
            Previous
          </Link>
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.pageCount}
        </span>

        <Button asChild variant="outline" size="sm" disabled={meta.page >= meta.pageCount}>
          <Link
            href={hrefForPage(searchParams, meta.page + 1)}
            aria-disabled={meta.page >= meta.pageCount}
            className={meta.page >= meta.pageCount ? "pointer-events-none opacity-50" : undefined}
            scroll={false}
          >
            Next
          </Link>
        </Button>
      </div>
    </div>
  );
}
