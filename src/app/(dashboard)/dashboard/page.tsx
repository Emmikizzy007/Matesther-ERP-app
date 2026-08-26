import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { getCurrentUser } from "@/features/auth/queries";
import { getFoundationSnapshot } from "@/features/dashboard/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Milestone 1 dashboard: proves the database connection and the tenant scoping
 * are live. The KPI widgets in Section 59 arrive with milestones 3–10.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const snapshot = await getFoundationSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description={`${ROLE_LABELS[user.role]} · ${ROLE_DESCRIPTIONS[user.role]}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organization</CardDescription>
            <CardTitle className="text-xl">{snapshot.organizationName}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Base currency {snapshot.currency} · {snapshot.timezone}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users in this organization</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{snapshot.userCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {snapshot.activeUserCount} active
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Database</CardDescription>
            <CardTitle className="text-xl">Connected</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Supabase PostgreSQL via Prisma
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered milestone</CardDescription>
            <CardTitle className="text-xl">1 — Foundation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Auth, tenancy, roles, schema, seed
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role coverage</CardTitle>
            <CardDescription>Seeded accounts per role in this organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.roleCounts.map((entry) => (
              <div key={entry.role} className="flex items-center justify-between gap-4 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium">{ROLE_LABELS[entry.role]}</span>
                  <span className="block truncate text-muted-foreground">
                    {ROLE_DESCRIPTIONS[entry.role]}
                  </span>
                </span>
                <Badge variant={entry.count > 0 ? "default" : "secondary"} className="tabular-nums">
                  {entry.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next milestone</CardTitle>
            <CardDescription>Milestone 2 — Customers &amp; Products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Customer and customer-contact records, product catalogue and categories.</p>
            <p>Delivered as CRUD with server-side search, filtering and pagination.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
