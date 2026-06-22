import { Module } from "@nestjs/common";

import { ConversationsModule } from "./conversations/conversations.module";
import { MatchingModule } from "./matching/matching.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProvidersModule } from "./providers/providers.module";
import { QuotesModule } from "./quotes/quotes.module";
import { ServiceCategoriesModule } from "./service-categories/service-categories.module";
import { ServiceRequestsModule } from "./service-requests/service-requests.module";

@Module({
  imports: [
    PrismaModule,
    MatchingModule,
    ServiceCategoriesModule,
    ServiceRequestsModule,
    ProvidersModule,
    ConversationsModule,
    QuotesModule
  ]
})
export class AppModule {}
