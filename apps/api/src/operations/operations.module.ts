import { ExternalServicesService } from "./external-services.service";
import { AdminOverviewService } from "./admin-overview.service";
import { Module } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { OperationsController, InternalOperationsController } from "./operations.controller";
@Module({ controllers: [OperationsController, InternalOperationsController], providers: [OperationsService, ExternalServicesService, AdminOverviewService] })
export class OperationsModule {}
