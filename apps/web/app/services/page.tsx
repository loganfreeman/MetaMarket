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
import Link from "next/link";

import { fetchApi } from "../lib/api";

export default async function ServicesPage() {
  const categoriesResult = await fetchApi<ServiceCategoryDto[]>("/service-categories");

  if (!categoriesResult.ok) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-normal">Services</h1>
        <Alert variant="destructive" className="mt-6">
          Service catalog unavailable. {categoriesResult.message}
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <Badge variant="secondary">Marketplace catalog</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Services</h1>
        <p className="max-w-2xl text-slate-600">
          Choose a service category. Each request form is rendered from the category metadata.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {categoriesResult.data.map((category) => (
          <Link key={category.id} href={`/services/${category.slug}`}>
            <Card className="h-full transition-colors hover:border-slate-300 hover:bg-slate-50">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                {category.description ? (
                  <CardDescription>{category.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <Badge variant={category.currentVersion ? "success" : "secondary"}>
                  {category.currentVersion
                    ? `Published v${category.currentVersion.version}`
                    : "Unpublished"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
