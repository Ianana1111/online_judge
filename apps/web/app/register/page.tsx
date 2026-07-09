import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm py-12 text-center">
      <h1 className="mb-3 font-display text-2xl font-bold text-ink-50">Accounts are provisioned for you</h1>
      <p className="mb-6 text-sm text-ink-400">
        This judge doesn't have public sign-up — your instructor creates your account for you. If you don't
        have credentials yet, ask them for a handle and password.
      </p>
      <Link href="/login" className="oj-btn-primary inline-block px-4 py-2 text-sm">
        Go to login
      </Link>
    </div>
  );
}
