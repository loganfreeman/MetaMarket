import { Body, Controller, Post } from "@nestjs/common";

import { ServiceRequestsService } from "./service-requests.service";

@Controller("service-requests")
export class ServiceRequestsController {
  constructor(private readonly serviceRequests: ServiceRequestsService) {}

  @Post()
  submit(@Body() body: unknown) {
    return this.serviceRequests.submit(body);
  }
}
