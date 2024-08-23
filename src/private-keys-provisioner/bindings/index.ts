import { API } from "..";
import * as Implementation from "../implementation";
import * as JWKSFactory from "../../jwks-factory";

export interface Dependencies {
  accessTokenPrivateKeySecretARN: string;
  refreshTokenPrivateKeySecretARN: string;
  jwksTableName: string;
}

/**
 * @param props.jwksFileKey The key of the JWKS file in the S3 bucket
 */
interface Props {
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  privateKeysRefreshIntervalInDays: number;
  region: string;
}

export const create =
  (deps: Dependencies) =>
  (props: Props): API.SecretsProvisioner => {
    const {
      accessTokenPrivateKeySecretARN,
      refreshTokenPrivateKeySecretARN,
      jwksTableName: tableName,
    } = deps;
    const {
      kidVersionStagePrefix,
      kidVersionStagePrefixSeparator,
      privateKeysRefreshIntervalInDays,
      region,
    } = props;

    const jwksFactory = JWKSFactory.Bindings.create();

    const accessTokenPrivateKeyStore = Implementation.PrivateKeyStore.create({
      privateKeySecretARN: accessTokenPrivateKeySecretARN,
    })({
      kidVersionStagePrefix,
      kidVersionStagePrefixSeparator,
      region,
    });
    const refreshTokenPrivateKeyStore = Implementation.PrivateKeyStore.create({
      privateKeySecretARN: refreshTokenPrivateKeySecretARN,
    })({
      kidVersionStagePrefix,
      kidVersionStagePrefixSeparator,
      region,
    });
    const jwksRepository = Implementation.JWKSRepository.create({})({
      region,
      tableName,
    });

    const secretsProvisioner = Implementation.SecretsProvisioner.create({
      accessTokenPrivateKeyStore,
      jwksFactory,
      jwksRepository,
      refreshTokenPrivateKeyStore,
    })({ privateKeysRefreshIntervalInDays });

    return secretsProvisioner;
  };
