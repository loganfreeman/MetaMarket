import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ServiceCategoriesService } from "./service-categories.service";

@Controller("service-categories")
export class ServiceCategoriesController {
  constructor(private readonly serviceCategories: ServiceCategoriesService) {}

  @Get()
  list() {
    return this.serviceCategories.list();
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.serviceCategories.getBySlug(slug);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.serviceCategories.create(body);
  }

  @Post(":slug/versions")
  createVersion(@Param("slug") slug: string, @Body() body: unknown) {
    return this.serviceCategories.createVersion(slug, body);
  }

  @Post(":slug/versions/:version/publish")
  publishVersion(@Param("slug") slug: string, @Param("version") version: string) {
    return this.serviceCategories.publishVersion(slug, Number(version));
  }
}
