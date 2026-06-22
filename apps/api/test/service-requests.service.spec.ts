import { BadRequestException } from "@nestjs/common";

import { ServiceRequestsService } from "../src/service-requests/service-requests.service";

describe("ServiceRequestsService", () => {
  it("validates submitted metadata and stores the current category version id", async () => {
    const create = jest.fn().mockResolvedValue({
      id: "request_1",
      categoryId: "category_1",
      categoryVersion: {
        metadataSchema: {
          fields: [
            { name: "description", label: "Description", type: "textarea", required: true },
            {
              name: "urgency",
              label: "Urgency",
              type: "select",
              required: true,
              options: ["today", "flexible"]
            }
          ]
        }
      }
    });
    const matching = { createMatchesForRequest: jest.fn().mockResolvedValue([]) };
    const prisma = {
      serviceCategory: {
        findUnique: jest.fn().mockResolvedValue({
          id: "category_1",
          slug: "example",
          currentVersion: {
            id: "version_1",
            metadataSchema: {
              fields: [
                { name: "description", label: "Description", type: "textarea", required: true },
                {
                  name: "urgency",
                  label: "Urgency",
                  type: "select",
                  required: true,
                  options: ["today", "flexible"]
                }
              ]
            }
          }
        })
      },
      serviceRequest: { create }
    };

    const service = new ServiceRequestsService(prisma as never, matching as never);

    await service.submit({
      categorySlug: "example",
      submittedMetadata: {
        description: "Need help",
        urgency: "today"
      }
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        categoryId: "category_1",
        categoryVersionId: "version_1",
        submittedMetadata: {
          description: "Need help",
          urgency: "today"
        },
        status: "submitted"
      }),
      include: expect.any(Object)
    });
    expect(matching.createMatchesForRequest).toHaveBeenCalled();
  });

  it("rejects submissions that do not match metadata", async () => {
    const prisma = {
      serviceCategory: {
        findUnique: jest.fn().mockResolvedValue({
          id: "category_1",
          slug: "example",
          currentVersion: {
            id: "version_1",
            metadataSchema: {
              fields: [
                {
                  name: "urgency",
                  label: "Urgency",
                  type: "select",
                  required: true,
                  options: ["today"]
                }
              ]
            }
          }
        })
      },
      serviceRequest: { create: jest.fn() }
    };

    const matching = { createMatchesForRequest: jest.fn() };
    const service = new ServiceRequestsService(prisma as never, matching as never);

    await expect(
      service.submit({
        categorySlug: "example",
        submittedMetadata: { urgency: "later" }
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
