import { JWK } from "jose";

export interface Key {
  keyID: string;
  jwk: JWK;
  publicKey: string;
  privateKey: string;
}
