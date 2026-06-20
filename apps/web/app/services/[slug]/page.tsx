import type { ServiceCategoryDto } from "@metamarket/shared";
import { notFound } from "next/navigation";

import { ServiceRequestForm } from "./ServiceRequestForm";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function ServiceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await fetch(`${apiUrl}/service-categories/${slug}`, { cache: "no-store" }).then((response) => {
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("failed to load service category");
    return response.json() as Promise<ServiceCategoryDto>;
  });

  if (!category?.currentVersion) notFound();

  return (
    <main className="page">
      <h1>{category.name}</h1>
      {category.description ? <p className="muted">{category.description}</p> : null}
      <ServiceRequestForm categorySlug={category.slug} metadataSchema={category.currentVersion.metadataSchema} />
    </main>
  );
}
