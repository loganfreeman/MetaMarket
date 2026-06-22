import { Module } from "@nestjs/common";

import { MatchingModule } from "../matching/matching.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ServiceRequestsController } from "./service-requests.controller";
import { ServiceRequestsService } from "./service-requests.service";

@Module({
  imports: [PrismaModule, MatchingModule],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService]
})
export class ServiceRequestsModule {}
