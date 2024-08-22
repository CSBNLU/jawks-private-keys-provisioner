import * as crypto from "crypto";

export const generateKeyPair = (): {
  publicKey: string;
  privateKey: string;
} => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-521",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
};
