import type { ServiceCategoryDto } from "@metamarket/shared";
import { Alert, Badge } from "@metamarket/ui";

import { adminFetch } from "./lib/api";
import { MetadataAdmin } from "./service-categories/MetadataAdmin";

export default async function AdminHomePage() {
  let categories: ServiceCategoryDto[] = [];
  let error: string | null = null;

  try {
    categories = await adminFetch<ServiceCategoryDto[]>("/service-categories");
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : "Unable to reach API";
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Metadata Admin</h1>
        <p className="max-w-2xl text-slate-600">
          Create service categories, draft metadata schemas, and publish immutable versions.
        </p>
      </div>
      {error ? (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      ) : null}
      <MetadataAdmin initialCategories={categories} />
    </main>
  );
}
