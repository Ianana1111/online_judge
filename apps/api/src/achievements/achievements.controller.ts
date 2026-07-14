import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { prisma } from "@oj/db";
import { Public } from "../common/decorators";
import { AchievementsService } from "./achievements.service";

@Controller("achievements")
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  @Public()
  @Get(":handle")
  async listForHandle(@Param("handle") handle: string) {
    const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!user) throw new NotFoundException("User not found");
    return this.achievements.listForUser(user.id);
  }
}
