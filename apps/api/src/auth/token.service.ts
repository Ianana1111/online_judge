import { Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { parseDurationMs } from "../common/duration.util";

export interface AccessTokenPayload {
  sub: string;
  handle: string;
  role: string;
  sid: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface DeleteReauthTokenPayload {
  sub: string;
  purpose: "delete-reauth";
}

@Injectable()
export class TokenService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret_change_me";
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret_change_me";
  private readonly accessTtl = process.env.JWT_ACCESS_TTL ?? "15m";
  private readonly refreshTtl = process.env.JWT_REFRESH_TTL ?? "7d";

  get accessTtlMs(): number {
    return parseDurationMs(this.accessTtl);
  }

  get refreshTtlMs(): number {
    return parseDurationMs(this.refreshTtl);
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ ...payload, purpose: "access" }, this.accessSecret, { algorithm: "HS256", issuer: "judge.tw", audience: "judge.tw:access", expiresIn: this.accessTtl as jwt.SignOptions["expiresIn"] });
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign({ ...payload, purpose: "refresh" }, this.refreshSecret, { algorithm: "HS256", issuer: "judge.tw", audience: "judge.tw:refresh", expiresIn: this.refreshTtl as jwt.SignOptions["expiresIn"] });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, this.accessSecret, { algorithms: ["HS256"], issuer: "judge.tw", audience: "judge.tw:access" });
    if (typeof payload === "string" || payload.purpose !== "access" || typeof payload.sub !== "string" ||
      typeof payload.handle !== "string" || !["USER", "ADMIN"].includes(payload.role) || typeof payload.sid !== "string") throw new Error("Invalid access token");
    return payload as unknown as AccessTokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = jwt.verify(token, this.refreshSecret, { algorithms: ["HS256"], issuer: "judge.tw", audience: "judge.tw:refresh" });
    if (typeof payload === "string" || payload.purpose !== "refresh" || typeof payload.sub !== "string" || typeof payload.jti !== "string") throw new Error("Invalid refresh token");
    return payload as unknown as RefreshTokenPayload;
  }

  /** Proves "this browser just re-authenticated with Google" for a Google-only (no password)
   * account's delete flow — see AuthController's googleStart/googleCallback intent=delete_account
   * branch. Reuses the access-token secret rather than a dedicated env var; the `purpose` field
   * keeps it from being confused with (or forged from) a normal access token. */
  signDeleteReauthToken(userId: string): string {
    return jwt.sign({ sub: userId, purpose: "delete-reauth" } satisfies DeleteReauthTokenPayload, this.accessSecret, {
      expiresIn: "5m",
      algorithm: "HS256", issuer: "judge.tw", audience: "judge.tw:delete-reauth",
    });
  }

  verifyDeleteReauthToken(token: string): DeleteReauthTokenPayload {
    const payload = jwt.verify(token, this.accessSecret, { algorithms: ["HS256"], issuer: "judge.tw", audience: "judge.tw:delete-reauth" }) as unknown as DeleteReauthTokenPayload;
    if (payload.purpose !== "delete-reauth") throw new Error("Wrong token purpose");
    return payload;
  }
}
