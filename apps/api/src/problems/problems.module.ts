import { Module } from "@nestjs/common";
import { ProblemsController } from "./problems.controller";
import { ProblemsService } from "./problems.service";
import { EditorialsService } from "./editorials.service";

@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, EditorialsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
