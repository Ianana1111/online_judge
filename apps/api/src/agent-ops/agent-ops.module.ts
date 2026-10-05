import { Module } from "@nestjs/common";
import { OperationsModule } from "../operations/operations.module";
import { AgentOpsController, AgentOpsRunnerController, AgentOpsTokenGuard } from "./agent-ops.controller";
import { AgentOpsService } from "./agent-ops.service";
@Module({ imports: [OperationsModule], controllers: [AgentOpsController, AgentOpsRunnerController], providers: [AgentOpsService, AgentOpsTokenGuard] })
export class AgentOpsModule {}
