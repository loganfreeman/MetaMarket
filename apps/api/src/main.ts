import { NestFactory } from "@nestjs/core";
import { toNodeHandler } from "better-auth/node";

import { AppModule } from "./app.module";
import { auth } from "./auth/auth";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.WEB_ORIGIN ?? "http://localhost:3000",
      process.env.ADMIN_ORIGIN ?? "http://localhost:3002"
    ],
    credentials: true
  });

  app.use("/auth", toNodeHandler(auth));

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();
