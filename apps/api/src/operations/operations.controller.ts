import { Controller, Get, NotFoundException, Req, Res, UseGuards } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { isIP } from "node:net";
import { Public, Roles } from "../common/decorators";
import { InternalTokenGuard } from "../common/internal-token.guard";
import { OperationsService } from "./operations.service";
@Controller("operations")
export class OperationsController {
  constructor(private readonly ops: OperationsService) {}
  @Roles("ADMIN") @Get()
  snapshot() { return this.ops.snapshot(); }
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
