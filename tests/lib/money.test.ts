import { describe, expect, it } from "vitest";

import { formatMoney } from "@/lib/format/money";

describe("formatMoney", () => {
  it("groups thousands and always shows two decimals", () => {
    expect(formatMoney("4500", "NGN")).toBe("NGN 4,500.00");
    expect(formatMoney("1234567.5", "NGN")).toBe("NGN 1,234,567.50");
    expect(formatMoney("0.05", "NGN")).toBe("NGN 0.05");
  });

  it("formats large values without floating point rounding", () => {
    expect(formatMoney("9007199254740993.99", "NGN")).toBe("NGN 9,007,199,254,740,993.99");
  });

  it("renders a dash for a missing amount", () => {
    expect(formatMoney(null, "NGN")).toBe("—");
    expect(formatMoney(undefined, "NGN")).toBe("—");
    expect(formatMoney("", "NGN")).toBe("—");
  });

  it("keeps a negative sign in front of the currency amount", () => {
    expect(formatMoney("-250.5", "NGN")).toBe("-NGN 250.50");
  });
});
