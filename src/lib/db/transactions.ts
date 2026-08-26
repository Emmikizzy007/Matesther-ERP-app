import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/** The transactional client handed to callbacks by {@link withTransaction}. */
export type TransactionClient = Prisma.TransactionClient;

/**
 * Runs a unit of work inside a database transaction.
 *
 * Every mutation that touches more than one row must go through here so that
 * production and financial state can never be left half-written (Section 55).
 */
export function withTransaction<T>(
  work: (tx: TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
): Promise<T> {
  return prisma.$transaction(work, options);
}
