import type { ProviderProfileDto } from "@metamarket/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input
} from "@metamarket/ui";
import Link from "next/link";

import { fetchApi } from "../lib/api";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; location?: string; categorySlug?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.location) query.set("location", params.location);
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);

  const providersResult = await fetchApi<ProviderProfileDto[]>(
    `/providers/search?${query.toString()}`
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">Provider search</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Search providers</h1>
      </div>

      <form className="mb-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <Input name="q" placeholder="Search keyword" defaultValue={params.q} />
        <Input name="location" placeholder="City or state" defaultValue={params.location} />
        <Input name="categorySlug" placeholder="Category slug" defaultValue={params.categorySlug} />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {providersResult.ok
          ? providersResult.data.map((provider) => (
              <Link key={provider.id} href={`/providers/${provider.id}`}>
                <Card className="h-full transition-colors hover:border-slate-300">
                  <CardHeader>
                    <CardTitle>{provider.displayName}</CardTitle>
                    <CardDescription>{provider.bio}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary">Rating {provider.rating.toFixed(1)}</Badge>
                    <div className="flex flex-wrap gap-2">
                      {provider.services?.flatMap((service) =>
                        service.skills.map((skill) => (
                          <Badge key={`${service.id}-${skill}`} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          : null}
      </div>
    </main>
  );
}
