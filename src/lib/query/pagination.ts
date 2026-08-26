import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Shared list-query shape: search term, page and page size (Milestone 2 deliverables). */
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).catch(DEFAULT_PAGE_SIZE),
});

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  /** 1-based index of the first row on this page; 0 when there are no rows. */
  from: number;
  to: number;
};

/**
 * Clamps the requested page into range so a stale `?page=99` link shows the last
 * page of results instead of an empty table.
 */
export function resolvePage(requestedPage: number, total: number, pageSize: number): PageMeta {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;

  return { page, pageSize, total, pageCount, from, to: Math.min(page * pageSize, total) };
}

export function skipFor(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
