import { Module } from "@nestjs/common";

import { PrismaModule } from "./prisma/prisma.module";
import { ServiceCategoriesModule } from "./service-categories/service-categories.module";
import { ServiceRequestsModule } from "./service-requests/service-requests.module";

@Module({
  imports: [PrismaModule, ServiceCategoriesModule, ServiceRequestsModule]
})
export class AppModule {}
