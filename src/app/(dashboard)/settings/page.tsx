import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { requirePagePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { ROLE_DESCRIPTIONS, ROLE_HIERARCHY, ROLE_LABELS } from "@/lib/constants/roles";
import { permissionsFor } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requirePagePermission("organization:manage");

  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: session.organizationId },
    select: {
      name: true,
      businessName: true,
      slug: true,
      email: true,
      phone: true,
      currency: true,
      timezone: true,
      createdAt: true,
    },
  });

  const details: [string, string][] = [
    ["Business name", organization.businessName],
    ["Trading name", organization.name],
    ["Slug", organization.slug],
    ["Email", organization.email ?? "—"],
    ["Phone", organization.phone ?? "—"],
    ["Currency", organization.currency],
    ["Timezone", organization.timezone],
    ["Created", organization.createdAt.toISOString().slice(0, 10)],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Organization profile and the role permission matrix." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>Business details used across documents and reports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles &amp; permissions</CardTitle>
          <CardDescription>
            Capabilities granted by each role. Enforced server-side on every mutation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ROLE_HIERARCHY.map((role, index) => (
            <div key={role} className="space-y-2">
              {index > 0 ? <Separator /> : null}
              <div className="pt-2">
                <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {permissionsFor(role).map((permission) => (
                  <Badge key={permission} variant="secondary" className="font-mono text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
