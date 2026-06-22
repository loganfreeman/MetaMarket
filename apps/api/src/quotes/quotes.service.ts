import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PrismaService } from "../prisma/prisma.service";

const quoteSchema = z.object({
  conversationId: z.string().min(1),
  amountCents: z.coerce.number().int().positive(),
  description: z.string().optional(),
  estimatedDate: z.coerce.date().optional()
});

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: unknown) {
    const input = parse(quoteSchema, body);
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: input.conversationId }
    });

    if (!conversation) throw new NotFoundException("conversation not found");

    const quote = await this.prisma.quote.create({
      data: {
        conversationId: conversation.id,
        serviceRequestId: conversation.serviceRequestId,
        providerProfileId: conversation.providerProfileId,
        amountCents: input.amountCents,
        description: input.description,
        estimatedDate: input.estimatedDate
      }
    });

    await this.prisma.serviceRequest.update({
      where: { id: conversation.serviceRequestId },
      data: { status: "quoted" }
    });

    return quote;
  }

  async accept(id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote) throw new NotFoundException("quote not found");

    await this.prisma.quote.updateMany({
      where: { serviceRequestId: quote.serviceRequestId },
      data: { status: "declined" }
    });

    const accepted = await this.prisma.quote.update({
      where: { id },
      data: { status: "accepted" }
    });

    await this.prisma.serviceRequest.update({
      where: { id: quote.serviceRequestId },
      data: { status: "accepted" }
    });

    return accepted;
  }
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}
