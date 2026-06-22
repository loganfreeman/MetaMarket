import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PrismaService } from "../prisma/prisma.service";

const startConversationSchema = z.object({
  serviceRequestId: z.string().min(1),
  providerProfileId: z.string().min(1),
  providerMatchId: z.string().optional(),
  senderUserId: z.string().optional(),
  body: z.string().min(1).optional()
});

const messageSchema = z.object({
  senderUserId: z.string().optional(),
  body: z.string().min(1)
});

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.conversation.findMany({
      include: {
        serviceRequest: { include: { category: true } },
        providerProfile: true,
        messages: { orderBy: { createdAt: "asc" } },
        quotes: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async get(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        serviceRequest: { include: { category: true } },
        providerProfile: true,
        messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
        quotes: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!conversation) throw new NotFoundException("conversation not found");
    return conversation;
  }

  async start(body: unknown) {
    const input = parse(startConversationSchema, body);

    const conversation = await this.prisma.conversation.upsert({
      where: {
        serviceRequestId_providerProfileId: {
          serviceRequestId: input.serviceRequestId,
          providerProfileId: input.providerProfileId
        }
      },
      update: {
        providerMatchId: input.providerMatchId
      },
      create: {
        serviceRequestId: input.serviceRequestId,
        providerProfileId: input.providerProfileId,
        providerMatchId: input.providerMatchId
      }
    });

    await this.prisma.serviceRequest.update({
      where: { id: input.serviceRequestId },
      data: { status: "contacted" }
    });

    if (input.providerMatchId) {
      await this.prisma.providerMatch.update({
        where: { id: input.providerMatchId },
        data: { status: "contacted" }
      });
    }

    if (input.body) {
      await this.addMessage(conversation.id, {
        senderUserId: input.senderUserId,
        body: input.body
      });
    }

    return this.get(conversation.id);
  }

  async addMessage(conversationId: string, body: unknown) {
    const input = parse(messageSchema, body);

    await this.prisma.message.create({
      data: {
        conversationId,
        senderUserId: input.senderUserId,
        body: input.body
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return this.get(conversationId);
  }
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.issues);
  return result.data;
}
