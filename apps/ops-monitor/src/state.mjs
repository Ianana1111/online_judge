import { createHash } from "node:crypto";
export const MONITOR_INTERVAL_MS = 5 * 60_000;
export function applyObservation(previous, checks, now = new Date()) {
  const at = now.toISOString();
  if (previous?.checkedAt && +now - Date.parse(previous.checkedAt) < 60_000) return previous;
  const incidents = (previous?.incidents ?? []).map(i => ({ ...i }));
  const current = checks.map(check => {
    const old = previous?.checks?.find(c => c.id === check.id);
    const failures = check.ok ? 0 : (old?.failures ?? 0) + 1;
    const healthy = check.ok ? (old?.healthy ?? 0) + 1 : 0;
    let incidentId = old?.incidentId ?? null;
    if (!check.ok && failures >= 2 && !incidentId) {
      incidentId = createHash("sha256").update(`${check.id}:${at}`).digest("hex").slice(0, 32);
      incidents.unshift({ id: incidentId, checkId: check.id, name: check.name, openedAt: at, firstFailedAt: old?.firstFailedAt ?? at, recoveredAt: null });
    }
    if (check.ok && healthy >= 2 && incidentId) {
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) incident.recoveredAt = at;
      incidentId = null;
    }
    return { ...check, failures, healthy, incidentId, firstFailedAt: check.ok ? null : old?.firstFailedAt ?? at };
  });
  const history = [...(previous?.history ?? []), { at, passed: checks.filter(c => c.ok).length, total: checks.length }].slice(-288);
  return { version: 1, checkedAt: at, checks: current, incidents: incidents.filter(i => !i.recoveredAt || Date.parse(i.recoveredAt) > +now - 30 * 86400_000).slice(0, 100), history };
}
export function publicStatus(state, now = Date.now()) {
  if (!state?.checkedAt) return { status: "UNKNOWN", checkedAt: null, checks: [], incidents: [], history: [] };
  const stale = now - Date.parse(state.checkedAt) > MONITOR_INTERVAL_MS * 3;
  return { status: stale ? "STALE" : state.checks.some(c => c.incidentId) ? "INCIDENT" : state.checks.some(c => !c.ok) ? "CHECKING" : "HEALTHY", checkedAt: state.checkedAt,
    checks: state.checks.map(c => ({ id: c.id, name: c.name, status: stale ? "UNKNOWN" : c.incidentId ? "FAIL" : c.ok ? "PASS" : "CHECKING", latencyMs: c.latencyMs })), incidents: state.incidents, history: state.history };
}
