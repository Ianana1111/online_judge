import { Module } from "@nestjs/common";
import { InternalRunsController } from "./internal.controller";
import { RunsController } from "./runs.controller";
import { RunsService } from "./runs.service";

@Module({
  controllers: [RunsController, InternalRunsController],
  providers: [RunsService],
})
export class RunsModule {}
