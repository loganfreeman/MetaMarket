import type { ServiceCategoryDto } from "@metamarket/shared";
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@metamarket/ui";
import { notFound } from "next/navigation";

import { fetchApi } from "../../lib/api";
import { ServiceRequestForm } from "./ServiceRequestForm";

export default async function ServiceCategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryResult = await fetchApi<ServiceCategoryDto>(`/service-categories/${slug}`);

  if (!categoryResult.ok) {
    if (categoryResult.status === 404) notFound();

    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-normal">Service unavailable</h1>
        <Alert variant="destructive" className="mt-6">
          {categoryResult.message}
        </Alert>
      </main>
    );
  }

  const category = categoryResult.data;
  if (!category?.currentVersion) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="success">Metadata v{category.currentVersion.version}</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">{category.name}</h1>
        {category.description ? <p className="text-slate-600">{category.description}</p> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service request</CardTitle>
          <CardDescription>
            This form is generated from the published category metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceRequestForm
            categorySlug={category.slug}
            metadataSchema={category.currentVersion.metadataSchema}
          />
        </CardContent>
      </Card>
    </main>
  );
}
