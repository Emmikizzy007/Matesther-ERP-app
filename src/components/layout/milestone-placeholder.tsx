import { Construction } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Every route in the Section 43 tree exists from Milestone 1 so navigation is
 * complete, but modules land one milestone at a time (Agent rules 1 and 2).
 */
export function MilestonePlaceholder({
  title,
  description,
  milestone,
  scope,
}: {
  title: string;
  description: string;
  milestone: number;
  scope: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card>
        <CardContent className="flex items-start gap-4 py-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Construction className="size-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Scheduled for milestone {milestone}</p>
            <p className="text-sm text-muted-foreground">{scope}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
