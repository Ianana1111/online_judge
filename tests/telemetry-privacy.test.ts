import { expect, it } from "vitest";
import { scrubTelemetryEvent, sentryIngestOrigin } from "../packages/shared/src/telemetryPrivacy";

it("keeps error stacks while removing credentials, submitted code and recovery links", () => {
  const event = { exception: { values: [{ type: "Error", value: "Invalid request", stacktrace: { frames: [{ filename: "service.ts", lineno: 42 }] } }] },
    user: { email: "private@example.test" }, extra: { secret: "private-value" }, breadcrumbs: [{ message: "secret-token" }],
    request: { url: "https://user:secret@judge.tw/reset-password?token=secret#token=secret", data: { password: "secret", sourceCode: "private-code" }, headers: { authorization: "Bearer secret" }, cookies: "secret", query_string: "token=secret" } };
  const scrubbed = scrubTelemetryEvent(event), serialized = JSON.stringify(scrubbed);
  expect(serialized).not.toMatch(/secret|private|authorization|password":/);
  expect(scrubbed.request.url).toBe("https://judge.tw/reset-password");
  expect(scrubbed.exception.values[0].stacktrace.frames[0].lineno).toBe(42);
});

it("only allows the configured HTTPS Sentry origin into CSP", () => {
  expect(sentryIngestOrigin("https://public-key@o1.ingest.sentry.io/123")).toBe("https://o1.ingest.sentry.io");
  for (const value of [undefined, "", "not-a-url", "http://insecure.test/1", "javascript:alert(1)"]) expect(sentryIngestOrigin(value)).toBeNull();
});
