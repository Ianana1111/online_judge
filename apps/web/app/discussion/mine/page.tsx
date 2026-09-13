import { Suspense } from "react";
import MyPosts from "@/components/MyPosts";
export const metadata = { title: "我的投稿", robots: { index: false, follow: false } };
export default function Page() { return <Suspense fallback={<p>載入投稿…</p>}><MyPosts /></Suspense>; }
