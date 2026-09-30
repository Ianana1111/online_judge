import { Body, Controller, Get, Header, Param, Patch, NotFoundException, Req, Res, UseGuards } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { isIP } from "node:net";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { InternalTokenGuard } from "../common/internal-token.guard";
import { serviceCostSchema, serviceKeySchema, type ServiceCostInput, type ServiceKey } from "@oj/shared";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ExternalServicesService } from "./external-services.service";
import { AdminOverviewService } from "./admin-overview.service";
import { OperationsService } from "./operations.service";
@Controller("operations")
export class OperationsController {
  constructor(private readonly ops: OperationsService, private readonly external: ExternalServicesService, private readonly overview: AdminOverviewService) {}
  @Roles("ADMIN") @Get()
  snapshot() { return this.ops.snapshot(); }
  @Roles("ADMIN") @Header("Cache-Control", "private, no-store") @Get("overview")
  summary() { return this.overview.get(); }
  @Roles("ADMIN") @Header("Cache-Control", "private, no-store") @Get("services")
  services() { return this.external.dashboard(); }
  @Roles("ADMIN") @Header("Cache-Control", "private, no-store") @Patch("services/:key")
  updateService(@Param("key", new ZodValidationPipe(serviceKeySchema)) key: ServiceKey, @Body(new ZodValidationPipe(serviceCostSchema)) body: ServiceCostInput, @CurrentUser() user: RequestUser) { return this.external.update(key, body, user.id); }
}
@Public() @UseGuards(InternalTokenGuard) @SkipThrottle() @Controller("internal/operations")
export class InternalOperationsController {
  constructor(private readonly ops: OperationsService) {}
  @Get() snapshot() { return this.ops.snapshot(); }
  /** Disabled unless an operator explicitly enables a short diagnostic window. The internal
   * service token is required; only peer/IP shape is returned, never arbitrary request headers. */
  @Get("edge")
  edge(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    if (process.env.EDGE_DIAGNOSTICS_ENABLED !== "true") throw new NotFoundException();
    response.setHeader("Cache-Control", "no-store");
    const header = request.headers["x-real-ip"];
    return { socketPeer: request.socket.remoteAddress ?? null, clientIp: typeof header === "string" && isIP(header) ? header : null, railwayEdgePresent: typeof request.headers["x-railway-edge"] === "string" };
  }
}
