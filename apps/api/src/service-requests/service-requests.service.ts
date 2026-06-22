import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { buildSubmissionSchema, parseMetadataSchema } from "@metamarket/shared";
import { z } from "zod";

import { MatchingService } from "../matching/matching.service";
import { PrismaService } from "../prisma/prisma.service";

const submitRequestSchema = z.object({
  categorySlug: z.string().min(1),
  submittedMetadata: z.record(z.unknown()),
  location: z
    .object({
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional()
    })
    .optional()
});

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matching: MatchingService
  ) {}

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

    const request = await this.prisma.serviceRequest.create({
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
      },
      include: {
        category: true,
        categoryVersion: true
      }
    });

    const matches = await this.matching.createMatchesForRequest(request);

    return {
      ...request,
      matches
    };
  }

  async list() {
    return this.prisma.serviceRequest.findMany({
      include: {
        category: true,
        matches: {
          include: {
            providerProfile: true,
            providerService: true,
            conversation: true
          },
          orderBy: { score: "desc" }
        },
        conversations: {
          include: {
            providerProfile: true,
            messages: { orderBy: { createdAt: "asc" } },
            quotes: true
          }
        },
        quotes: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async get(id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        category: true,
        categoryVersion: true,
        matches: {
          include: {
            providerProfile: true,
            providerService: { include: { serviceAreas: true } },
            conversation: true
          },
          orderBy: { score: "desc" }
        },
        conversations: {
          include: {
            providerProfile: true,
            messages: { orderBy: { createdAt: "asc" } },
            quotes: true
          },
          orderBy: { updatedAt: "desc" }
        },
        quotes: {
          include: { providerProfile: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!request) throw new NotFoundException("service request not found");
    return request;
  }
}

function parseSubmitRequest(body: unknown) {
  const result = submitRequestSchema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}
