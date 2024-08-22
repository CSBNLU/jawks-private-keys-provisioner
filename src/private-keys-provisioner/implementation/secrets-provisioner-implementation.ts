import { API } from "..";
import * as JWKSFactory from "../../jwks-factory";

export interface Dependencies {
  accessTokenPrivateKeyStore: API.PrivateKeyStore;
  jwksFactory: JWKSFactory.API.JWKSFactory;
  jwksRepository: API.JWKSRepository;
  refreshTokenPrivateKeyStore: API.PrivateKeyStore;
}

export const create = (deps: Dependencies): API.SecretsProvisioner => {
  const {
    accessTokenPrivateKeyStore,
    jwksFactory,
    jwksRepository,
    refreshTokenPrivateKeyStore,
  } = deps;

  return {
    provision: async () => {
      const { accessToken, refreshToken } = await jwksFactory.create();
      // 1. Store the private key in AWS Secrets Manager
      await accessTokenPrivateKeyStore.storeKey({
        kid: accessToken.keyID,
        privateKey: accessToken.privateKey,
      });

      // 2. Store the private key in AWS Secrets Manager
      await refreshTokenPrivateKeyStore.storeKey({
        kid: refreshToken.keyID,
        privateKey: refreshToken.privateKey,
      });

      // 3. Store the JWKs in DynamoDB
      await jwksRepository.store({ jwks: [accessToken.jwk, refreshToken.jwk] });
    },
  };
};
