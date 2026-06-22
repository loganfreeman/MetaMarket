import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ConversationsService } from "./conversations.service";

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list() {
    return this.conversations.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.conversations.get(id);
  }

  @Post()
  start(@Body() body: unknown) {
    return this.conversations.start(body);
  }

  @Post(":id/messages")
  addMessage(@Param("id") id: string, @Body() body: unknown) {
    return this.conversations.addMessage(id, body);
  }
}
