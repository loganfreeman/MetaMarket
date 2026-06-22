import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { PrismaService } from "../prisma/prisma.service";

const providerProfileSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1),
  bio: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  availability: z.unknown().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  active: z.boolean().optional()
});

const providerServiceSchema = z.object({
  categorySlug: z.string().min(1),
  skills: z.array(z.string().min(1)).default([]),
  hourlyRateCents: z.coerce.number().int().positive().optional(),
  quoteMode: z.enum(["hourly", "quote"]).optional(),
  serviceAreas: z
    .array(
      z.object({
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
        latitude: z.coerce.number().optional(),
        longitude: z.coerce.number().optional(),
        radiusMiles: z.coerce.number().int().positive().optional()
      })
    )
    .default([])
});

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.providerProfile.findMany({
      where: { active: true },
      include: {
        user: true,
        services: {
          include: {
            category: true,
            serviceAreas: true
          }
        }
      },
      orderBy: { displayName: "asc" }
    });
  }

  async search({
    categorySlug,
    q,
    location
  }: {
    categorySlug?: string;
    q?: string;
    location?: string;
  }) {
    const providers = await this.prisma.providerProfile.findMany({
      where: {
        active: true,
        services: {
          some: {
            active: true,
            category: categorySlug ? { slug: categorySlug } : undefined
          }
        }
      },
      include: {
        services: {
          include: {
            category: true,
            serviceAreas: true
          }
        }
      },
      orderBy: { rating: "desc" }
    });

    const query = normalize(q ?? "");
    const place = normalize(location ?? "");

    return providers.filter((provider) => {
      const searchable = normalize(
        [
          provider.displayName,
          provider.bio,
          ...provider.services.flatMap((service) => [
            service.category.name,
            service.category.slug,
            ...service.skills,
            ...service.serviceAreas.flatMap((area) => [area.city, area.region])
          ])
        ]
          .filter(Boolean)
          .join(" ")
      );

      const matchesQuery = !query || searchable.includes(query);
      const matchesLocation = !place || searchable.includes(place);
      return matchesQuery && matchesLocation;
    });
  }

  async get(id: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        services: {
          include: {
            category: true,
            serviceAreas: true
          }
        },
        quotes: true
      }
    });

    if (!provider) throw new NotFoundException("provider not found");
    return provider;
  }

  async createProfile(body: unknown) {
    const input = parse(providerProfileSchema, body);

    await this.prisma.user.update({
      where: { id: input.userId },
      data: { role: "provider" }
    });

    const availability = input.availability as Prisma.InputJsonValue | undefined;

    return this.prisma.providerProfile.upsert({
      where: { userId: input.userId },
      update: {
        displayName: input.displayName,
        bio: input.bio,
        profilePhotoUrl: input.profilePhotoUrl,
        availability,
        rating: input.rating,
        active: input.active ?? true
      },
      create: {
        userId: input.userId,
        displayName: input.displayName,
        bio: input.bio,
        profilePhotoUrl: input.profilePhotoUrl,
        availability,
        rating: input.rating,
        active: input.active ?? true
      }
    });
  }

  async addService(providerProfileId: string, body: unknown) {
    const input = parse(providerServiceSchema, body);
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug: input.categorySlug }
    });

    if (!category) throw new NotFoundException("service category not found");

    const serviceAreas = input.serviceAreas ?? [];

    return this.prisma.providerService.upsert({
      where: {
        providerProfileId_categoryId: {
          providerProfileId,
          categoryId: category.id
        }
      },
      update: {
        skills: input.skills,
        hourlyRateCents: input.hourlyRateCents,
        quoteMode: input.quoteMode ?? "quote",
        active: true,
        serviceAreas: {
          deleteMany: {},
          create: serviceAreas.map((area) => ({
            city: area.city,
            region: area.region,
            country: area.country ?? "US",
            latitude: area.latitude,
            longitude: area.longitude,
            radiusMiles: area.radiusMiles ?? 25
          }))
        }
      },
      create: {
        providerProfileId,
        categoryId: category.id,
        skills: input.skills,
        hourlyRateCents: input.hourlyRateCents,
        quoteMode: input.quoteMode ?? "quote",
        serviceAreas: {
          create: serviceAreas.map((area) => ({
            city: area.city,
            region: area.region,
            country: area.country ?? "US",
            latitude: area.latitude,
            longitude: area.longitude,
            radiusMiles: area.radiusMiles ?? 25
          }))
        }
      },
      include: {
        category: true,
        serviceAreas: true
      }
    });
  }
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
