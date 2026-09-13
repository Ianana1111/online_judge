import AccountRecoveryForm from "@/components/AccountRecoveryForm";
export const metadata = { title: "驗證信箱 | judge.tw", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page() { return <AccountRecoveryForm mode="verify" />; }
