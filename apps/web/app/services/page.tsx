import type { ServiceCategoryDto } from "@metamarket/shared";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function ServicesPage() {
  const categories = await fetch(`${apiUrl}/service-categories`, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error("failed to load service categories");
    return response.json() as Promise<ServiceCategoryDto[]>;
  });

  return (
    <main className="page">
      <h1>Services</h1>
      <div className="grid">
        {categories.map((category) => (
          <Link key={category.id} href={`/services/${category.slug}`} className="card">
            <h2>{category.name}</h2>
            {category.description ? <p className="muted">{category.description}</p> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
