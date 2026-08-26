/**
 * Money arrives from Prisma as a Decimal and crosses into client components as
 * a decimal string. Formatting groups the digits textually so no value is ever
 * routed through a JavaScript float (Section 2.1, Agent rule 8).
 */
export function formatMoney(amount: string | null | undefined, currency: string): string {
  if (amount === null || amount === undefined || amount === "") return "—";

  const negative = amount.startsWith("-");
  const [whole = "0", fraction = ""] = amount.replace(/^[+-]/, "").split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cents = `${fraction}00`.slice(0, 2);

  return `${negative ? "-" : ""}${currency} ${grouped}.${cents}`;
}
