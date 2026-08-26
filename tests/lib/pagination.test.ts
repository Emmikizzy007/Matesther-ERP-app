import { describe, expect, it } from "vitest";

import { resolvePage, skipFor } from "@/lib/query/pagination";

describe("resolvePage", () => {
  it("describes the middle page of a result set", () => {
    expect(resolvePage(2, 45, 20)).toEqual({
      page: 2,
      pageSize: 20,
      total: 45,
      pageCount: 3,
      from: 21,
      to: 40,
    });
  });

  it("clamps a page beyond the end back to the last page", () => {
    expect(resolvePage(99, 45, 20).page).toBe(3);
    expect(resolvePage(99, 45, 20).to).toBe(45);
  });

  it("reports an empty result set as a single page with no rows", () => {
    expect(resolvePage(1, 0, 20)).toEqual({
      page: 1,
      pageSize: 20,
      total: 0,
      pageCount: 1,
      from: 0,
      to: 0,
    });
  });
});

describe("skipFor", () => {
  it("offsets by whole pages", () => {
    expect(skipFor(1, 20)).toBe(0);
    expect(skipFor(3, 20)).toBe(40);
  });
});
