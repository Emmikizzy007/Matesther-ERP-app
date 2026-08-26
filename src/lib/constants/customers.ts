import { CustomerType } from "@prisma/client";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  SCHOOL: "School",
  COMPANY: "Company",
  ORGANIZATION: "Organization",
  INDIVIDUAL: "Individual",
  OTHER: "Other",
};

export const CUSTOMER_TYPES = Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[];
