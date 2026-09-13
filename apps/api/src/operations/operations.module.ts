import { Module } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { OperationsController, InternalOperationsController } from "./operations.controller";
@Module({ controllers: [OperationsController, InternalOperationsController], providers: [OperationsService] })
export class OperationsModule {}
