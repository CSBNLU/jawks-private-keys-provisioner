import { API } from "..";
import { JWK } from "jose";
import * as JWKSFactory from "../../jwks-factory";
import * as luxon from "luxon";

export interface Dependencies {
  accessTokenPrivateKeyStore: API.PrivateKeyStore;
  jwksFactory: JWKSFactory.API.JWKSFactory;
  jwksRepository: API.JWKSRepository;
  refreshTokenPrivateKeyStore: API.PrivateKeyStore;
}

interface Props {
  privateKeysRefreshIntervalInDays: number;
}

export const create =
  (deps: Dependencies) =>
  (props: Props): API.SecretsProvisioner => {
    const {
      accessTokenPrivateKeyStore,
      jwksFactory,
      jwksRepository,
      refreshTokenPrivateKeyStore,
    } = deps;

    const { privateKeysRefreshIntervalInDays } = props;

    return {
      provision: async () => {
        const now = luxon.DateTime.now();

        // 1. Retrieve the latest version creation date for the access token and refresh token private keys
        const latestAccessTokenVersionCreationDate =
          await accessTokenPrivateKeyStore.retrieveLatestVersionCreationDate();
        const latestRefreshTokenVersionCreationDate =
          await refreshTokenPrivateKeyStore.retrieveLatestVersionCreationDate();
        const refreshInterval = luxon.Duration.fromObject({
          days: privateKeysRefreshIntervalInDays,
        });

        // 2. Check if the keys are still valid
        const accessTokenKeyStillValid =
          latestAccessTokenVersionCreationDate &&
          now.minus(refreshInterval) <=
            luxon.DateTime.fromJSDate(latestAccessTokenVersionCreationDate);

        const refreshTokenKeyStillValid =
          latestRefreshTokenVersionCreationDate &&
          now.minus(refreshInterval) <=
            luxon.DateTime.fromJSDate(latestRefreshTokenVersionCreationDate);

        if (accessTokenKeyStillValid && refreshTokenKeyStillValid) {
          // If both keys are still valid, skip updating the keys.
          return;
        }

        // 3. Create new keys
        const { accessToken, refreshToken } = await jwksFactory.create();

        let jwks: JWK[] = [];

        // 4. If the access token key has expired, store the private key in AWS Secrets Manager
        if (!accessTokenKeyStillValid) {
          await accessTokenPrivateKeyStore.storeKey({
            kid: accessToken.keyID,
            privateKey: accessToken.privateKey,
          });
          jwks = jwks.concat(accessToken.jwk);
        }

        // 5. If the refresh token key has expired, store the private key in AWS Secrets Manager
        if (!refreshTokenKeyStillValid) {
          await refreshTokenPrivateKeyStore.storeKey({
            kid: refreshToken.keyID,
            privateKey: refreshToken.privateKey,
          });
          jwks = jwks.concat(refreshToken.jwk);
        }

        // 6. If there are new keys, store them in the JWKS repository
        if (jwks.length > 0) {
          await jwksRepository.store({
            jwks: [accessToken.jwk, refreshToken.jwk],
          });
        }
      },
    };
  };
