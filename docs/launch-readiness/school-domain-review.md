# Assisted school verification

The Ministry of Education school catalog remains the source of school names. Its static, evidenced email roots and separately approved exact domains are distinct datasets. Requests cannot introduce a new school name or grant `isStudent`/Pro privileges.

The picker was reconciled against the official **115 academic-year** university, open/continuing college, religious college and military/police rosters on 2026-09-13. All 163 official records map to 158 selectable institutions; five attached continuing colleges map to their parents. Official codes, names, mappings, source URLs and downloaded SHA-256 hashes are retained under `rosterVerification` in the catalog. This checks institutional coverage, not real mailbox delivery. Existing email roots were preserved; uncertain roots use assisted review. Sources: [MOE announcement](https://depart.moe.edu.tw/ed4500/News_Content.aspx?n=63F5AB3D02A8BBAC&s=52D3798D5069E231&sms=1FF9979D10DBF9F3), [universities](https://stats.moe.gov.tw/files/school/115/u1_new.ods), [open/continuing colleges](https://stats.moe.gov.tw/files/school/115/u2_new.ods), [religious colleges](https://stats.moe.gov.tw/files/school/115/u3_new.ods), [military/police colleges](https://stats.moe.gov.tw/files/school/115/school08_new.ods).

Settings lets an unverified user submit a domain plus an HTTPS institutional `edu.tw` documentation URL and explanation. No identity-document upload is requested. One request per user can be pending; daily and endpoint rate limits apply. No supplied URL is fetched by the API, avoiding an SSRF surface.

The administrator queue at `/admin/schools` requires MFA for decisions. A human checks the submitted official source and domain ownership. Cross-school root/subdomain overlap is rejected, concurrent decisions are serialized, and stale versions fail. Decisions retain the operator, date and applicant-visible rationale; the applicant receives an in-app notification. Requests and decisions survive account deletion with the requester relation removed.

An approved assisted domain is exact, without implicit subdomain trust. It only permits the existing mailbox challenge. Request/confirm still bind the current school, exact email, newest token and one-account-per-mailbox ledger. Revoking approval blocks new verifications; it does not retroactively erase proof of historical mailbox ownership. Existing static-domain changes require a reviewed catalog change.

New school links use `/verify-school#token=...`, remove the fragment after capture and require an explicit POST confirmation. Legacy GET links redirect to that confirmation screen without consuming the challenge. Tokens expire after 30 minutes; opening an email scanner link does not verify a user.

Local integration and browser tests use synthetic inboxes and no real email delivery. Real institutional mail delivery, spam filtering and owner acceptance remain external checks.
