import { describe, expect, it } from "vitest";
import { automaticRepairPayload } from "../apps/api/src/agent-ops/auto-repair.policy";
import { automaticSourceAllowed, validateRepairPlan } from "../apps/ops-runner/src/repair-planner";

const now = new Date("2026-10-07T04:00:00Z");
const output = { summary: "需要檢查應用程式", specialist: "ENGINEER", findings: [{ text: "功能驗證失敗", evidenceIds: ["functional-verification"] }], hypotheses: [], actions: [{ title: "檢查", detail: "重現後提出修復", risk: "CHANGE_REQUIRED" }], limitations: [], review: "SUPPORTED" };
const report = () => ({ id: "report", kind: "INCIDENT", status: "COMPLETED", completedAt: now, steps: [{}, {}, { role: "REVIEW", output }], evidence: [{ id: "functional-verification", label: "巡檢", observedAt: now.toISOString(), data: { outcome: "FAIL" } }], incident: { id: "incident", title: "功能異常", code: "FUNCTIONAL_VERIFICATION_FAILED", recoveredAt: null as Date | null, lastSeenAt: now } });
describe("automatic repair handoff", () => {
  it("only hands off supported, fresh, unresolved reports with change recommendations", () => {
    expect(automaticRepairPayload(report(), now)).toMatchObject({ automatic: true, incidentId: "incident", files: [] });
    expect(automaticRepairPayload({ ...report(), kind: "DAILY" }, now)).toBeNull();
    expect(automaticRepairPayload({ ...report(), incident: { ...report().incident, recoveredAt: now } }, now)).toBeNull();
    expect(automaticRepairPayload(report(), new Date(+now + 31 * 60_000))).toBeNull();
    for (const changed of [{ review: "NEEDS_EVIDENCE" }, { actions: [] }, { findings: [{ text: "假證據", evidenceIds: ["unknown"] }] }]) {
      expect(automaticRepairPayload({ ...report(), steps: [{}, {}, { role: "REVIEW", output: { ...output, ...changed } }] }, now)).toBeNull();
    }
    expect(automaticRepairPayload({ ...report(), steps: [null, null, null] }, now)).toBeNull();
  });
  it("confines automatic source selection and rejects invented or duplicate paths", () => {
    const path = "apps/web/lib/textPreview.ts";
    expect(automaticSourceAllowed(path)).toBe(true);
    for (const file of ["apps/api/src/auth/auth.service.ts", "apps/api/src/billing/billing.service.ts", "apps/api/src/common/mail.service.ts", "packages/shared/src/opsWorkflow.ts", "apps/web/middleware.ts", "tests/helper.ts"]) expect(automaticSourceAllowed(file)).toBe(false);
    expect(validateRepairPlan({ action: "INSPECT", files: [path], explanation: "檢查實作" }, [path]).files).toEqual([path]);
    expect(() => validateRepairPlan({ action: "INSPECT", files: [path, path], explanation: "重複" }, [path])).toThrow();
    expect(() => validateRepairPlan({ action: "INSPECT", files: ["apps/web/lib/invented.ts"], explanation: "不存在" }, [path])).toThrow();
    expect(() => validateRepairPlan({ action: "NEEDS_INPUT", files: [path], explanation: "矛盾" }, [path])).toThrow();
    expect(() => validateRepairPlan({ action: "INSPECT", files: [], explanation: "無範圍" }, [path])).toThrow();
  });
});
