import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { prisma } from "@oj/db";
import type { ResolveRefundDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";

@Injectable()
export class RefundReconciliationService {
  /** Records an operator's evidence. This method never invokes a bank or payment API. */
  async resolve(requestId: string, actor: RequestUser, dto: ResolveRefundDto) {
    if (actor.role !== "ADMIN" || !actor.mfaVerified) throw new ForbiddenException("An MFA-verified administrator is required for refund reconciliation.");
    const requestHash = createHash("sha256").update(JSON.stringify({ requestId, actorId: actor.id, ...dto })).digest("hex");
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM refund_requests WHERE id = ${requestId} FOR UPDATE`;
      const previous = await tx.refundResolution.findUnique({ where: { clientRequestId: dto.clientRequestId } });
      if (previous) {
        if (previous.requestHash !== requestHash) throw new ConflictException("This request identifier was already used for another decision.");
        return { id: previous.id, status: previous.resultingStatus };
      }
      const request = await tx.refundRequest.findUnique({ where: { id: requestId } });
      if (!request) throw new NotFoundException("Refund request not found");
      if (request.status !== "NEEDS_REVIEW" || request.updatedAt.toISOString() !== dto.expectedUpdatedAt) throw new ConflictException("This refund changed. Refresh and review the latest state.");
      if (request.merchantTradeNo !== dto.merchantTradeNo || request.amountNtd !== dto.amountNtd) throw new BadRequestException("Order or amount does not match the refund request.");
      if (dto.decision === "CONFIRM_NO_ACTION" && (!dto.noGatewayActionConfirmed || request.refundConfirmedAt)) throw new BadRequestException("A confirmed or uncertain refund cannot be repeated.");
      if (dto.decision === "CONFIRM_REFUNDED" && !dto.cancellationConfirmed) throw new BadRequestException("Recurring cancellation must be confirmed.");
      const status = dto.decision === "CONFIRM_REFUNDED" ? "COMPLETED" : "NEEDS_REVIEW";
      const now = new Date();
      if (dto.decision === "CONFIRM_REFUNDED") {
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${request.userId} FOR UPDATE`;
        const user = await tx.user.findUnique({ where: { id: request.userId } });
        const payment = await tx.payment.findUnique({ where: { id: request.paymentId } });
        if (payment && (payment.userId !== request.userId || payment.amountNtd !== request.amountNtd || payment.merchantTradeNo !== request.merchantTradeNo)) throw new ConflictException("Payment ledger does not match this refund.");
        if (user && payment?.status !== "REFUNDED") {
          if (payment?.entitlementStartsAt && payment.entitlementEndsAt) {
            if (user.planExpiresAt) {
              const attributable = Math.min(+payment.entitlementEndsAt - +payment.entitlementStartsAt, Math.max(0, +payment.entitlementEndsAt - +now));
              if (attributable < 0) throw new ConflictException("Invalid entitlement interval requires investigation.");
              const expires = new Date(Math.max(+now, +user.planExpiresAt - attributable));
              await tx.user.update({ where: { id: user.id }, data: { plan: +expires > +now ? "PRO" : "FREE", planExpiresAt: expires, planCancelRequested: false } });
            }
          } else if (!dto.preserveUnattributedEntitlement) {
            throw new ConflictException("This legacy entitlement cannot be attributed safely. Explicitly preserve it and record the reason, or keep the request under review.");
          }
        }
        await tx.subscription.updateMany({ where: { merchantTradeNo: request.merchantTradeNo, userId: request.userId }, data: { status: "CANCELLED", cancelledAt: now } });
        if (payment) await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED", reviewedAt: now, reviewedBy: actor.id } });
      }
      await tx.refundRequest.update({ where: { id: request.id }, data: {
        status, processingToken: null, lastError: dto.decision === "KEEP_REVIEW" ? request.lastError : null,
        ...(dto.decision === "CONFIRM_REFUNDED" ? { inFlightAction: null } : {}),
        ...(dto.decision !== "KEEP_REVIEW" && dto.cancellationConfirmed ? { cancellationConfirmedAt: request.cancellationConfirmedAt ?? now } : {}),
        ...(dto.decision === "CONFIRM_REFUNDED" ? { completedAt: now, refundConfirmedAt: request.refundConfirmedAt ?? now } : {}),
      } });
      const event = await tx.refundResolution.create({ data: { requestId, clientRequestId: dto.clientRequestId, requestHash, actorId: actor.id, decision: dto.decision, evidenceReference: dto.evidenceReference, reason: dto.reason, previousStatus: request.status, resultingStatus: status } });
      return { id: event.id, status };
    });
  }

  history(requestId: string) {
    return prisma.refundResolution.findMany({ where: { requestId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50,
      select: { id: true, actorId: true, decision: true, evidenceReference: true, reason: true, previousStatus: true, resultingStatus: true, createdAt: true } });
  }
}
