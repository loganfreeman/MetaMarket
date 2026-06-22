import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

import { ProvidersService } from "./providers.service";

@Controller("providers")
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get()
  list() {
    return this.providers.list();
  }

  @Get("search")
  search(
    @Query("categorySlug") categorySlug?: string,
    @Query("q") q?: string,
    @Query("location") location?: string
  ) {
    return this.providers.search({ categorySlug, q, location });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.providers.get(id);
  }

  @Post()
  createProfile(@Body() body: unknown) {
    return this.providers.createProfile(body);
  }

  @Post(":id/services")
  addService(@Param("id") id: string, @Body() body: unknown) {
    return this.providers.addService(id, body);
  }
}
