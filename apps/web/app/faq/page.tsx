import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { jsonLdScript } from "@/lib/jsonLd";
import { FAQ_SECTIONS } from "@/lib/faq";
import FaqContent from "@/components/FaqContent";
export const metadata: Metadata = { title: "FAQ", description: "常見問題：程式評測、虛擬測驗、訂閱退款、學校驗證與通知。", alternates: { canonical: `${SITE_URL}/faq` } };
const structuredData = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ_SECTIONS.flatMap((s) => s.items.map((i) => ({ "@type": "Question", name: i.question["zh-TW"], acceptedAnswer: { "@type": "Answer", text: i.answer["zh-TW"] } }))) };
export default function FaqPage() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }} /><FaqContent /></>; }
