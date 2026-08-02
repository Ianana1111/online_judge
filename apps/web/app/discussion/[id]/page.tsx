import type { Metadata } from "next";
import { serverFetch } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";
import { previewText } from "@/lib/textPreview";
import type { PostDetail } from "@/lib/types";
import PostDetailClient from "@/components/PostDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await serverFetch<PostDetail>(`/posts/${id}`);
  if (!post) return {};

  const description = previewText(post.bodyMd, 160);
  const url = `${SITE_URL}/discussion/${id}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: post.title, description, url, authors: [post.authorHandle] },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await serverFetch<PostDetail>(`/posts/${id}`);

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: previewText(post.bodyMd, 300),
        url: `${SITE_URL}/discussion/${id}`,
        datePublished: post.createdAt,
        author: { "@type": post.isOfficial ? "Organization" : "Person", name: post.authorHandle },
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PostDetailClient id={id} />
    </>
  );
}
