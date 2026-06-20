import type { ServiceCategoryDto } from "@metamarket/shared";
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
      <main className="page">
        <h1>Service unavailable</h1>
        <div className="card">
          <p className="muted">{categoryResult.message}</p>
        </div>
      </main>
    );
  }

  const category = categoryResult.data;
  if (!category?.currentVersion) notFound();

  return (
    <main className="page">
      <h1>{category.name}</h1>
      {category.description ? <p className="muted">{category.description}</p> : null}
      <ServiceRequestForm
        categorySlug={category.slug}
        metadataSchema={category.currentVersion.metadataSchema}
      />
    </main>
  );
}
