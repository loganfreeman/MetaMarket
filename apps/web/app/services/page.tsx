import type { ServiceCategoryDto } from "@metamarket/shared";
import Link from "next/link";

import { fetchApi } from "../lib/api";

export default async function ServicesPage() {
  const categoriesResult = await fetchApi<ServiceCategoryDto[]>("/service-categories");

  if (!categoriesResult.ok) {
    return (
      <main className="page">
        <h1>Services</h1>
        <div className="card">
          <h2>Service catalog unavailable</h2>
          <p className="muted">{categoriesResult.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Services</h1>
      <div className="grid">
        {categoriesResult.data.map((category) => (
          <Link key={category.id} href={`/services/${category.slug}`} className="card">
            <h2>{category.name}</h2>
            {category.description ? <p className="muted">{category.description}</p> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
