import ClassDetailClient from "@/components/ClassDetailClient";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassDetailClient classId={id} backHref="/classes" />;
}
