import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { buildSubmissionSchema, parseMetadataSchema } from "@metamarket/shared";
import { z } from "zod";

import { PrismaService } from "../prisma/prisma.service";

const submitRequestSchema = z.object({
  categorySlug: z.string().min(1),
  submittedMetadata: z.record(z.unknown()),
  location: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional()
  }).optional()
});

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(body: unknown) {
    const input = parseSubmitRequest(body);
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug: input.categorySlug },
      include: { currentVersion: true }
    });

    if (!category || !category.currentVersion) {
      throw new NotFoundException("published service category not found");
    }

    const metadataSchema = parseMetadataSchema(category.currentVersion.metadataSchema);
    const validation = buildSubmissionSchema(metadataSchema).safeParse(input.submittedMetadata);

    if (!validation.success) {
      throw new BadRequestException({
        message: "submitted metadata does not match category metadata",
        issues: validation.error.issues
      });
    }

    const location = input.location ?? {};

    return this.prisma.serviceRequest.create({
      data: {
        categoryId: category.id,
        categoryVersionId: category.currentVersion.id,
        submittedMetadata: validation.data,
        addressLine1: location.addressLine1,
        addressLine2: location.addressLine2,
        city: location.city,
        region: location.region,
        postalCode: location.postalCode,
        country: location.country ?? "US",
        latitude: location.latitude,
        longitude: location.longitude,
        status: "submitted"
      }
    });
  }
}

function parseSubmitRequest(body: unknown) {
  const result = submitRequestSchema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}
