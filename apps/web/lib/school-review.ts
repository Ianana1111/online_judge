export type SchoolDomainRequest = {
  id: string; school: string; domain: string; officialUrl: string; explanation: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED"; createdAt: string; updatedAt: string;
  decisions: { status: string; note: string; createdAt: string; actorId?: string }[];
};
export const schoolReviewLabels = { PENDING: ["等待審核", "Pending review"], APPROVED: ["已開放驗證", "Approved"], REJECTED: ["需補充資料", "Not approved"], REVOKED: ["已停止受理此網域", "Revoked"] } as const;
