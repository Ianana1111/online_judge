# Account recovery and administrator MFA

Implementation: password recovery, explicit email confirmation, TOTP enrollment, MFA step-up, ten one-use recovery codes, code replacement, disable flow for optional MFA, and account security history. Password and Google login both produce a restricted session until an enabled second factor is verified. The API enforces the restriction; frontend redirects are only guidance. Refresh carries an existing MFA proof for at most twelve hours from verification.

## Runtime setup

Set a new independent `ACCOUNT_SECURITY_KEY` in the API secret manager: 32 cryptographically random bytes represented by 64 hexadecimal characters. It encrypts TOTP secrets and pending email delivery tokens with AES-256-GCM and account/purpose binding. Keep an independent recovery-vault copy. Do not replace it without decrypting and re-encrypting existing records under a maintenance procedure.

Set `RESEND_API_KEY` and an approved `RESEND_FROM_EMAIL`. New recovery links are queued durably and delivered by the API worker with retries and an idempotency key. Delivery credentials/tokens are erased after success or expiry. Password recovery replies do not reveal whether an address exists and do not wait for the mail provider. Case-ambiguous legacy email addresses and Google-only accounts are not reset through the password endpoint.

After deploying migrations and configuring encryption, the owner enrolls an authenticator in **Settings → Security**, confirms a code and saves the recovery codes. Then set `ADMIN_MFA_REQUIRED=true` to require enrollment for all administrator accounts. Requiring MFA without an encryption key fails startup. Enabled MFA is always enforced, even while administrator enrollment enforcement is off. The owner must perform authenticator enrollment; an agent cannot attest to possession of the owner's device.

Google-only users reauthenticate with the same linked Google subject before changing MFA. The resulting proof is restricted to the security purpose, current session and five-minute lifetime. A password reset never disables MFA, consumes a recovery code or automatically logs the user in. Database credential generations invalidate old access and refresh credentials even if Redis cleanup fails or a concurrent password login finishes late.

Reset links expire in 30 minutes; email verification links in 60 minutes. Bearer tokens are random, validated using a SHA-256 digest, bound to email and credential generation and consumed transactionally. They are placed in URL fragments, removed from browser history and confirmed only by POST; visiting a link or an email scanner GET does not consume it. Recovery codes are high-entropy random values stored only as digests. TOTP verification accepts one adjacent time step and atomically rejects reused counters.

## Verification and remaining acceptance

Real disposable PostgreSQL/Redis tests cover concurrent reset, stale/wrong-purpose links, changed email, durable delivery/retry, access/refresh revocation, Google-only handling, encrypted-secret tampering, TOTP vectors, MFA enrollment/session restrictions, atomic recovery use, replacement and disabling. Browser tests cover desktop/mobile Chromium, Firefox, WebKit and iPhone-sized WebKit. Browser workflow tests use controlled API responses; database integration tests exercise the services directly. Real mailbox delivery, owner enrollment and actual iPhone device testing remain separate acceptance gates.

References: [OWASP recovery](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [OWASP MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html), [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238).
