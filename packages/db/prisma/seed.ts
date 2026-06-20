import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "plumbing",
    name: "Plumbing",
    description: "Pipe, drain, fixture, and water heater service requests.",
    metadataSchema: {
      fields: [
        { name: "issue", label: "What do you need help with?", type: "textarea", required: true },
        { name: "urgency", label: "Urgency", type: "select", required: true, options: ["today", "this_week", "flexible"] },
        { name: "photos", label: "Photos", type: "file", required: false }
      ]
    }
  },
  {
    slug: "electrical",
    name: "Electrical",
    description: "Electrical repair and installation service requests.",
    metadataSchema: {
      fields: [
        { name: "issue", label: "Describe the electrical work", type: "textarea", required: true },
        { name: "property_type", label: "Property Type", type: "select", required: true, options: ["house", "condo", "apartment", "commercial"] },
        { name: "preferred_date", label: "Preferred Date", type: "date", required: false }
      ]
    }
  },
  {
    slug: "handyman",
    name: "Handyman",
    description: "General home repair and maintenance service requests.",
    metadataSchema: {
      fields: [
        { name: "task", label: "What task should be completed?", type: "textarea", required: true },
        { name: "estimated_hours", label: "Estimated Hours", type: "number", required: false },
        { name: "address", label: "Service Address", type: "address", required: true }
      ]
    }
  }
];

async function main() {
  for (const categoryData of categories) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: categoryData.slug },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        active: true
      },
      create: {
        slug: categoryData.slug,
        name: categoryData.name,
        description: categoryData.description,
        active: true
      }
    });

    const existingVersion = await prisma.serviceCategoryVersion.findUnique({
      where: { categoryId_version: { categoryId: category.id, version: 1 } }
    });
    const version = existingVersion ?? (await prisma.serviceCategoryVersion.create({
      data: {
        categoryId: category.id,
        version: 1,
        status: "published",
        metadataSchema: categoryData.metadataSchema,
        publishedAt: new Date()
      }
    }));

    await prisma.serviceCategory.update({
      where: { id: category.id },
      data: { currentVersionId: version.id }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
