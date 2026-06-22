import { Body, Controller, Param, Patch, Post } from "@nestjs/common";

import { QuotesService } from "./quotes.service";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Post()
  create(@Body() body: unknown) {
    return this.quotes.create(body);
  }

  @Patch(":id/accept")
  accept(@Param("id") id: string) {
    return this.quotes.accept(id);
  }
}
