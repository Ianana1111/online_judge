import ClassDetailClient from "@/components/ClassDetailClient";

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; classId: string }>;
}) {
  const { studentId, classId } = await params;
  return <ClassDetailClient classId={classId} backHref={`/admin/classes/${studentId}`} />;
}
