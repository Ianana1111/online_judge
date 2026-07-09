import { Module } from "@nestjs/common";
import { InternalSubmissionsController } from "./internal.controller";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";

@Module({
  controllers: [SubmissionsController, InternalSubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
