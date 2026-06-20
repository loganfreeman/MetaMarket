import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { parseMetadataSchema } from "@metamarket/shared";
import { z } from "zod";

import { PrismaService } from "../prisma/prisma.service";

const createCategorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional()
});

const createVersionSchema = z.object({
  metadataSchema: z.unknown()
});

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.serviceCategory.findMany({
      where: { active: true },
      include: { currentVersion: true },
      orderBy: { name: "asc" }
    });
  }

  async getBySlug(slug: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug },
      include: { currentVersion: true }
    });

    if (!category) throw new NotFoundException("service category not found");
    return category;
  }

  async create(body: unknown) {
    const input = parseRequest(createCategorySchema, body);

    return this.prisma.serviceCategory.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        active: input.active ?? true
      }
    });
  }

  async createVersion(slug: string, body: unknown) {
    const input = parseRequest(createVersionSchema, body);
    const metadataSchema = parseMetadata(input.metadataSchema);
    const category = await this.prisma.serviceCategory.findUnique({ where: { slug }, include: { versions: true } });

    if (!category) throw new NotFoundException("service category not found");

    const version = category.versions.reduce((max, item) => Math.max(max, item.version), 0) + 1;

    return this.prisma.serviceCategoryVersion.create({
      data: {
        categoryId: category.id,
        version,
        status: "draft",
        metadataSchema
      }
    });
  }

  async publishVersion(slug: string, version: number) {
    if (!Number.isInteger(version) || version < 1) throw new BadRequestException("invalid version");

    const category = await this.prisma.serviceCategory.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException("service category not found");

    const categoryVersion = await this.prisma.serviceCategoryVersion.findUnique({
      where: { categoryId_version: { categoryId: category.id, version } }
    });

    if (!categoryVersion) throw new NotFoundException("service category version not found");
    parseMetadata(categoryVersion.metadataSchema);

    const publishedVersion = await this.prisma.serviceCategoryVersion.update({
      where: { id: categoryVersion.id },
      data: {
        status: "published",
        publishedAt: categoryVersion.publishedAt ?? new Date()
      }
    });

    await this.prisma.serviceCategory.update({
      where: { id: category.id },
      data: { currentVersionId: publishedVersion.id }
    });

    return publishedVersion;
  }
}

function parseRequest<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}

function parseMetadata(value: unknown) {
  try {
    return parseMetadataSchema(value);
  } catch (error) {
    if (error instanceof z.ZodError) throw new BadRequestException(error.issues);
    throw error;
  }
}
