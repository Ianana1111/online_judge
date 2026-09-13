import { Suspense } from "react";
import PostComposer from "@/components/PostComposer";
export const metadata = { title: "投稿", robots: { index: false, follow: false } };
export default function Page() { return <Suspense fallback={<p>載入編輯器…</p>}><PostComposer /></Suspense>; }
