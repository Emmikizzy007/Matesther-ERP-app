/** Raw `searchParams` as delivered to an App Router page. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Collapses a repeated query parameter to its first value. */
export function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
