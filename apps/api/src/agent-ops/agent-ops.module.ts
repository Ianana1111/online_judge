import { OpsWorkflowService } from "./ops-workflow.service";
import { OpsWorkflowController, OpsTaskRunnerController } from "./ops-workflow.controller";
import { Module } from "@nestjs/common";
import { OperationsModule } from "../operations/operations.module";
import { AgentOpsController, AgentOpsRunnerController, AgentOpsTokenGuard } from "./agent-ops.controller";
import { AgentOpsService } from "./agent-ops.service";
@Module({ imports: [OperationsModule], controllers: [AgentOpsController, AgentOpsRunnerController, OpsWorkflowController, OpsTaskRunnerController], providers: [AgentOpsService, AgentOpsTokenGuard, OpsWorkflowService] })
export class AgentOpsModule {}
