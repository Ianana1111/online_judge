import AccountRecoveryForm from "@/components/AccountRecoveryForm";
export const metadata = { title: "找回帳號 | judge.tw", robots: { index: false, follow: false } };
export default function Page() { return <AccountRecoveryForm mode="request" />; }
