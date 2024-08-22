import { JWK } from "jose";

export type JWKSet = {
  keys: JWK[];
};

export interface JWKSRepository {
  store: (props: { jwks: JWK[] }) => Promise<void>;
}
