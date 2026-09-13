export interface CommunityPage<T> { items: T[]; nextCursor: string | null }
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUPERSEDED";
export type PostCategory = "GENERAL" | "QUESTION" | "EDITORIAL" | "ANNOUNCEMENT";
export const categories: Record<PostCategory, [string, string]> = {
  GENERAL: ["交流分享", "General"], QUESTION: ["解題提問", "Questions"], EDITORIAL: ["解題思路", "Editorials"], ANNOUNCEMENT: ["官方公告", "Announcements"],
};
export const reviewLabels: Record<ReviewStatus, [string, string]> = {
  PENDING: ["等待審核", "Pending review"], APPROVED: ["已通過審核", "Approved"], REJECTED: ["需要修改", "Changes requested"], SUPERSEDED: ["已提交更新版本", "Replaced by a new version"],
};
export interface OwnPost { id: string; title: string; status: ReviewStatus; reason: string | null; publishedAt: string | null; createdAt: string }
export interface EditablePost extends Omit<OwnPost, "createdAt"> { bodyMd: string; category: PostCategory; isOfficial: boolean }
export interface ReviewItem {
  status: ReviewStatus; reason: string | null; reviewedAt: string | null;
  id: string; title: string | null; body: string; category: PostCategory | null; isOfficial: boolean; createdAt: string;
  postId: string | null; discussionId: string | null;
  post: { title: string; bodyMd: string; publishedAt: string | null; author: { handle: string } } | null;
  discussion: { body: string; postId: string | null; problem: { title: string; slug: string } | null; user: { handle: string } } | null;
}
