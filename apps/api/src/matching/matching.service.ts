import { Injectable } from "@nestjs/common";
import { parseMetadataSchema } from "@metamarket/shared";

import { PrismaService } from "../prisma/prisma.service";

type RequestForMatching = {
  id: string;
  categoryId: string;
  city?: string | null;
  region?: string | null;
  latitude?: { toNumber(): number } | number | null;
  longitude?: { toNumber(): number } | number | null;
  categoryVersion: {
    metadataSchema: unknown;
  };
};

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async createMatchesForRequest(serviceRequest: RequestForMatching) {
    const metadataSchema = parseMetadataSchema(serviceRequest.categoryVersion.metadataSchema);
    const matching = metadataSchema.matching ?? {};
    const requiredSkills = new Set((matching.requiredSkills ?? []).map(normalize));
    const maxRadiusMiles = matching.radiusMiles ?? 25;
    const minRating = matching.minRating ?? 0;

    const providerServices = await this.prisma.providerService.findMany({
      where: {
        categoryId: serviceRequest.categoryId,
        active: true,
        providerProfile: {
          active: true,
          rating: { gte: minRating }
        }
      },
      include: {
        providerProfile: true,
        serviceAreas: true
      }
    });

    const candidates = providerServices
      .map((providerService) => {
        const skillScore = scoreSkills(requiredSkills, providerService.skills);
        const locationScore = scoreLocation(
          serviceRequest,
          providerService.serviceAreas,
          maxRadiusMiles
        );

        if (!skillScore.matched || !locationScore.matched) return null;

        const score =
          providerService.providerProfile.rating * 10 + skillScore.score + locationScore.score;
        return {
          providerService,
          score,
          reasons: [...skillScore.reasons, ...locationScore.reasons]
        };
      })
      .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
      .sort((a, b) => b.score - a.score);

    const matches = [];

    for (const candidate of candidates) {
      const match = await this.prisma.providerMatch.upsert({
        where: {
          serviceRequestId_providerProfileId: {
            serviceRequestId: serviceRequest.id,
            providerProfileId: candidate.providerService.providerProfileId
          }
        },
        update: {
          providerServiceId: candidate.providerService.id,
          score: candidate.score,
          reasons: candidate.reasons
        },
        create: {
          serviceRequestId: serviceRequest.id,
          providerProfileId: candidate.providerService.providerProfileId,
          providerServiceId: candidate.providerService.id,
          score: candidate.score,
          reasons: candidate.reasons
        },
        include: {
          providerProfile: true,
          providerService: true
        }
      });

      matches.push(match);
    }

    if (matches.length > 0) {
      await this.prisma.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: { status: "matched" }
      });
    }

    return matches;
  }
}

function scoreSkills(requiredSkills: Set<string>, providerSkills: string[]) {
  if (requiredSkills.size === 0) {
    return { matched: true, score: 10, reasons: ["No required skills configured"] };
  }

  const providerSkillSet = new Set(providerSkills.map(normalize));
  const missing = [...requiredSkills].filter((skill) => !providerSkillSet.has(skill));

  if (missing.length > 0) {
    return { matched: false, score: 0, reasons: [`Missing skills: ${missing.join(", ")}`] };
  }

  return {
    matched: true,
    score: requiredSkills.size * 20,
    reasons: [`Matched required skills: ${[...requiredSkills].join(", ")}`]
  };
}

function scoreLocation(
  request: RequestForMatching,
  serviceAreas: Array<{
    city?: string | null;
    region?: string | null;
    latitude?: { toNumber(): number } | number | null;
    longitude?: { toNumber(): number } | number | null;
    radiusMiles: number;
  }>,
  maxRadiusMiles: number
) {
  if (serviceAreas.length === 0) {
    return { matched: true, score: 0, reasons: ["No service area configured"] };
  }

  for (const area of serviceAreas) {
    if (area.city && request.city && normalize(area.city) === normalize(request.city)) {
      return { matched: true, score: 15, reasons: [`Matched city: ${area.city}`] };
    }

    if (area.region && request.region && normalize(area.region) === normalize(request.region)) {
      return { matched: true, score: 8, reasons: [`Matched region: ${area.region}`] };
    }

    const distance = distanceMiles(
      toNumber(request.latitude),
      toNumber(request.longitude),
      toNumber(area.latitude),
      toNumber(area.longitude)
    );
    const radius = Math.min(area.radiusMiles, maxRadiusMiles);

    if (distance !== null && distance <= radius) {
      return {
        matched: true,
        score: Math.max(1, 20 - distance / 5),
        reasons: [`Within ${Math.round(distance)} miles`]
      };
    }
  }

  return { matched: false, score: 0, reasons: ["Outside service area"] };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : value.toNumber();
}

function distanceMiles(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;

  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
