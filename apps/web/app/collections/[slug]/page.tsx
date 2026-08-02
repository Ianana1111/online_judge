import type { Metadata } from "next";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import type { CollectionDetail } from "@/lib/types";
import CollectionDetailClient from "@/components/CollectionDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await serverFetch<CollectionDetail>(`/collections/${slug}`);
  if (!collection) return {};

  const title = collection.title;
  const description = collection.description || `${collection.problems.length} curated problems in the ${collection.title} collection.`;
  const url = `${SITE_URL}/collections/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CollectionDetailClient slug={slug} />;
}
