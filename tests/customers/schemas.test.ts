import { CustomerType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  CustomerContactSchema,
  CustomerListParamsSchema,
  CustomerSchema,
} from "@/features/customers/schemas";

const UUID = "3f1c2f8a-6d0b-4f7a-9c8e-1a2b3c4d5e6f";

describe("CustomerSchema", () => {
  it("trims text and normalises blank optional fields to null", () => {
    const parsed = CustomerSchema.parse({
      name: "  Bright Future School  ",
      customerType: "SCHOOL",
      phone: "",
      email: "",
      address: "  12 Awolowo Road  ",
      contactPerson: "",
      notes: "",
    });

    expect(parsed).toEqual({
      name: "Bright Future School",
      customerType: CustomerType.SCHOOL,
      phone: null,
      email: null,
      address: "12 Awolowo Road",
      contactPerson: null,
      notes: null,
    });
  });

  it("rejects a short name, an unknown type and a malformed email", () => {
    const result = CustomerSchema.safeParse({
      name: "A",
      customerType: "GOVERNMENT",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    const issues = result.error?.issues.map((issue) => issue.path.join("."));
    expect(issues).toEqual(expect.arrayContaining(["name", "customerType", "email"]));
  });
});

describe("CustomerContactSchema", () => {
  it("treats a missing checkbox as false and 'on' as true", () => {
    const base = { customerId: UUID, name: "Mrs Adeyemi", phone: "+2348030000001" };

    expect(CustomerContactSchema.parse(base).isPrimary).toBe(false);
    expect(CustomerContactSchema.parse({ ...base, isPrimary: "on" }).isPrimary).toBe(true);
  });

  it("requires a customer id and a phone number", () => {
    const result = CustomerContactSchema.safeParse({ customerId: "nope", name: "Mrs Adeyemi", phone: "12" });

    expect(result.success).toBe(false);
    const issues = result.error?.issues.map((issue) => issue.path.join("."));
    expect(issues).toEqual(expect.arrayContaining(["customerId", "phone"]));
  });
});

describe("CustomerListParamsSchema", () => {
  it("defaults to the first page of active customers", () => {
    expect(CustomerListParamsSchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      q: "",
      status: "active",
      type: undefined,
    });
  });

  it("falls back to safe values instead of throwing on hostile query strings", () => {
    const parsed = CustomerListParamsSchema.parse({
      page: "-3",
      pageSize: "100000",
      status: "deleted",
      type: "ALIEN",
    });

    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.status).toBe("active");
    expect(parsed.type).toBeUndefined();
  });
});
