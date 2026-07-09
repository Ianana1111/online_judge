import { Injectable } from "@nestjs/common";
import jwt from "jsonwebtoken";
import { parseDurationMs } from "../common/duration.util";

export interface AccessTokenPayload {
  sub: string;
  handle: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
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
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessTtl as jwt.SignOptions["expiresIn"] });
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTtl as jwt.SignOptions["expiresIn"] });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, this.accessSecret) as unknown as AccessTokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, this.refreshSecret) as unknown as RefreshTokenPayload;
  }
}
