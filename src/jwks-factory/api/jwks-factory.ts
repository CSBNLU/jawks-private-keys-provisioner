import { Key } from "./key";

export interface JWKSFactory {
  create: () => Promise<{
    accessToken: Key;
    refreshToken: Key;
  }>;
}
