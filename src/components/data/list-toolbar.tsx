"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ToolbarSelect = {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

const SEARCH_DEBOUNCE_MS = 300;
/** Sentinel for "no filter", since a Radix SelectItem cannot have an empty value. */
const ANY = "__any";

/**
 * List filters live in the URL so a filtered view is linkable and the table
 * itself stays a server component.
 */
export function ListToolbar({
  searchPlaceholder,
  searchValue,
  selects = [],
}: {
  searchPlaceholder: string;
  searchValue: string;
  selects?: ToolbarSelect[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchValue);

  // Keep the input in step with back/forward navigation.
  useEffect(() => setSearch(searchValue), [searchValue]);

  function apply(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // Any filter change invalidates the current page offset.
    params.delete("page");

    const query = params.toString();
    startTransition(() => router.replace(query ? `?${query}` : "?", { scroll: false }));
  }

  useEffect(() => {
    if (search === searchValue) return;

    const timer = setTimeout(() => apply({ q: search }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `apply` closes over the current params, which is what the timer should use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchValue]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor="list-search">Search</Label>
        <Input
          id="list-search"
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => setSearch(event.target.value)}
          aria-busy={isPending}
        />
      </div>

      {selects.map((select) => (
        <div key={select.name} className="space-y-1.5">
          <Label htmlFor={`filter-${select.name}`}>{select.label}</Label>
          <Select
            value={select.value === "" ? ANY : select.value}
            onValueChange={(value) => apply({ [select.name]: value === ANY ? null : value })}
          >
            <SelectTrigger id={`filter-${select.name}`} className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {select.options.map((option) => (
                <SelectItem key={option.value || ANY} value={option.value === "" ? ANY : option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
