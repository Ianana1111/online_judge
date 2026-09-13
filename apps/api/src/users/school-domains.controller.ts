import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { z } from "zod";
import { CurrentUser, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SchoolDomainsService, schoolDomainRequestSchema, schoolDomainReviewSchema } from "./school-domains.service";
const listing = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED", "REVOKED"]).default("PENDING"), before: z.string().cuid().optional() });
@Controller("users")
export class SchoolDomainsController {
  constructor(private readonly schools: SchoolDomainsService) {}
  @Get("me/school/domains") domains(@Query("school", new ZodValidationPipe(z.string().max(100))) school: string) { return this.schools.domains(school); }
  @Get("me/school/domain-requests") mine(@CurrentUser() user: RequestUser) { return this.schools.mine(user.id); }
  @Post("me/school/domain-requests") @Throttle({ default: { limit: 3, ttl: 3600000 } })
  request(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(schoolDomainRequestSchema)) body: z.infer<typeof schoolDomainRequestSchema>) { return this.schools.request(user.id, body); }
  @Roles("ADMIN") @Get("school-domain-requests") list(@Query(new ZodValidationPipe(listing)) query: z.infer<typeof listing>) { return this.schools.list(query.status, query.before); }
  @Roles("ADMIN") @Post("school-domain-requests/:id/review")
  review(@CurrentUser() user: RequestUser, @Param("id", new ZodValidationPipe(z.string().cuid())) id: string, @Body(new ZodValidationPipe(schoolDomainReviewSchema)) body: z.infer<typeof schoolDomainReviewSchema>) { return this.schools.review(user, id, body); }
}
