import ContestDetailClient from "@/components/ContestDetailClient";

export default async function ContestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContestDetailClient contestId={id} />;
}
