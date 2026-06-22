import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "plumbing",
    name: "Plumbing",
    description: "Pipe, drain, fixture, and water heater service requests.",
    metadataSchema: {
      matching: {
        requiredSkills: ["plumbing"],
        radiusMiles: 25,
        minRating: 0
      },
      fields: [
        { name: "issue", label: "What do you need help with?", type: "textarea", required: true },
        {
          name: "urgency",
          label: "Urgency",
          type: "select",
          required: true,
          options: ["today", "this_week", "flexible"]
        },
        { name: "photos", label: "Photos", type: "file", required: false }
      ]
    }
  },
  {
    slug: "electrical",
    name: "Electrical",
    description: "Electrical repair and installation service requests.",
    metadataSchema: {
      matching: {
        requiredSkills: ["electrical"],
        radiusMiles: 25,
        minRating: 0
      },
      fields: [
        { name: "issue", label: "Describe the electrical work", type: "textarea", required: true },
        {
          name: "property_type",
          label: "Property Type",
          type: "select",
          required: true,
          options: ["house", "condo", "apartment", "commercial"]
        },
        { name: "preferred_date", label: "Preferred Date", type: "date", required: false }
      ]
    }
  },
  {
    slug: "handyman",
    name: "Handyman",
    description: "General home repair and maintenance service requests.",
    metadataSchema: {
      matching: {
        requiredSkills: ["handyman"],
        radiusMiles: 25,
        minRating: 0
      },
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
    const version =
      existingVersion ??
      (await prisma.serviceCategoryVersion.create({
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

  const seededCategories = await prisma.serviceCategory.findMany();
  const categoryBySlug = new Map(seededCategories.map((category) => [category.slug, category]));

  const providers = [
    {
      user: {
        id: "seed_provider_home_services",
        name: "Home Services Provider",
        email: "provider-home@example.com"
      },
      profile: {
        displayName: "Home Services Co",
        bio: "General local service provider for common household requests.",
        rating: 4.7
      },
      services: [
        { categorySlug: "plumbing", skills: ["plumbing"], city: "Salt Lake City", region: "UT" },
        { categorySlug: "handyman", skills: ["handyman"], city: "Salt Lake City", region: "UT" }
      ]
    },
    {
      user: {
        id: "seed_provider_electrical",
        name: "Electrical Provider",
        email: "provider-electrical@example.com"
      },
      profile: {
        displayName: "Metro Electrical Services",
        bio: "Licensed electrical service provider for local requests.",
        rating: 4.9
      },
      services: [
        { categorySlug: "electrical", skills: ["electrical"], city: "Salt Lake City", region: "UT" }
      ]
    }
  ];

  for (const providerData of providers) {
    const user = await prisma.user.upsert({
      where: { id: providerData.user.id },
      update: {
        name: providerData.user.name,
        email: providerData.user.email,
        role: "provider"
      },
      create: {
        id: providerData.user.id,
        name: providerData.user.name,
        email: providerData.user.email,
        emailVerified: true,
        role: "provider"
      }
    });

    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: providerData.profile.displayName,
        bio: providerData.profile.bio,
        rating: providerData.profile.rating,
        active: true
      },
      create: {
        userId: user.id,
        displayName: providerData.profile.displayName,
        bio: providerData.profile.bio,
        rating: providerData.profile.rating,
        active: true
      }
    });

    for (const serviceData of providerData.services) {
      const category = categoryBySlug.get(serviceData.categorySlug);
      if (!category) continue;

      await prisma.providerService.upsert({
        where: {
          providerProfileId_categoryId: {
            providerProfileId: profile.id,
            categoryId: category.id
          }
        },
        update: {
          skills: serviceData.skills,
          active: true,
          serviceAreas: {
            deleteMany: {},
            create: {
              city: serviceData.city,
              region: serviceData.region,
              country: "US",
              radiusMiles: 25
            }
          }
        },
        create: {
          providerProfileId: profile.id,
          categoryId: category.id,
          skills: serviceData.skills,
          active: true,
          serviceAreas: {
            create: {
              city: serviceData.city,
              region: serviceData.region,
              country: "US",
              radiusMiles: 25
            }
          }
        }
      });
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
