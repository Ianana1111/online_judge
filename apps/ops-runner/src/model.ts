// Owner-selected policy: no stronger-model or API-key fallback.
export const OPS_MODEL = "gpt-6-sol";
export const OPS_REASONING_EFFORT = "high";
export function selectedOpsModel(requested?: string) {
  if (requested && requested !== OPS_MODEL) throw new Error(`JudgeOps workers are restricted to ${OPS_MODEL}`);
  return OPS_MODEL;
}
