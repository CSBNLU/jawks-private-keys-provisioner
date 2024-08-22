import * as crypto from "crypto";
import { exportJWK, importSPKI, JWK } from "jose";
import { generateKeyPair } from "./generateKeypair";

// Generate a key pair, convert it to JWK, and return the key ID, JWK, public key, and private key
export const generateKey = async (
  name: string,
): Promise<{
  keyID: string;
  jwk: JWK;
  publicKey: string;
  privateKey: string;
}> => {
  // Generate an ES512 key pair

  // Generate a key ID (kid) for the JWK
  const generateKeyId = (keyType: "ES512", name: string): string => {
    const timestamp = Date.now().toString();
    const randomComponent = crypto.randomBytes(8).toString("hex");
    return `${name}-${keyType}-${timestamp}-${randomComponent}`;
  };

  // Convert PEM to JWK
  const convertToJWK = async (publicKey: string, keyId: string) => {
    const key = await importSPKI(publicKey, "ES512", { extractable: true });
    const jwkKey = await exportJWK(key);
    jwkKey.kid = keyId; // Add the Key ID
    jwkKey.alg = "ES512"; // Algorithm
    jwkKey.use = "sig"; // Key use: signature
    return jwkKey;
  };

  // 1. Generate the key pair
  const { publicKey, privateKey } = generateKeyPair();
  // 2. Generate the key ID
  const keyID = generateKeyId("ES512", name);
  // 3. Convert the public key to JWK
  const jwk = await convertToJWK(publicKey, keyID);

  return { keyID, jwk, publicKey, privateKey };
};
