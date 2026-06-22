import type { ProviderProfileDto } from "@metamarket/shared";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@metamarket/ui";
import { notFound } from "next/navigation";

import { fetchApi } from "../../lib/api";

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providerResult = await fetchApi<ProviderProfileDto>(`/providers/${id}`);

  if (!providerResult.ok) notFound();

  const provider = providerResult.data;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">Provider</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">{provider.displayName}</h1>
        {provider.bio ? <p className="text-slate-600">{provider.bio}</p> : null}
      </div>

      <div className="grid gap-4">
        {provider.services?.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle>{service.category?.name ?? "Service"}</CardTitle>
              <CardDescription>
                {service.quoteMode === "hourly" && service.hourlyRateCents
                  ? `$${(service.hourlyRateCents / 100).toFixed(0)} / hour`
                  : "Quote-based"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                {service.serviceAreas
                  ?.map((area) => `${area.city ?? "Any city"}, ${area.region ?? "Any region"}`)
                  .join(" · ")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
