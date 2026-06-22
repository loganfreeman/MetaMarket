import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ServiceRequestsService } from "./service-requests.service";

@Controller("service-requests")
export class ServiceRequestsController {
  constructor(private readonly serviceRequests: ServiceRequestsService) {}

  @Get()
  list() {
    return this.serviceRequests.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.serviceRequests.get(id);
  }

  @Post()
  submit(@Body() body: unknown) {
    return this.serviceRequests.submit(body);
  }
}
