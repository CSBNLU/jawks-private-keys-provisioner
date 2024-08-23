import { Bindings } from "../private-keys-provisioner/index.js";
import { z } from "zod";

interface EnvironmentConfig {
  accessTokenSecretARN: string;
  refreshTokenSecretARN: string;
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  region: string;
  jwksTableName: string;
}

const environmentConfigSchema = z.object({
  accessTokenSecretARN: z.string(),
  refreshTokenSecretARN: z.string(),
  kidVersionStagePrefix: z.string(),
  kidVersionStagePrefixSeparator: z.string(),
  region: z.string(),
  jwksTableName: z.string(),
});

const rawEnvironmentConfig: EnvironmentConfig = {
  accessTokenSecretARN: process.env.ACCESS_TOKEN_SECRET_ARN as string,
  refreshTokenSecretARN: process.env.REFRESH_TOKEN_SECRET_ARN as string,
  kidVersionStagePrefix: process.env.KID_VERSION_STAGE_PREFIX as string,
  kidVersionStagePrefixSeparator: process.env
    .KID_VERSION_STAGE_PREFIX_SEPARATOR as string,
  region: process.env.REGION as string,
  jwksTableName: process.env.TABLE_NAME as string,
};

const environmentConfig: EnvironmentConfig =
  environmentConfigSchema.parse(rawEnvironmentConfig);

const secretsProvisioner = Bindings.create({
  accessTokenPrivateKeySecretARN: environmentConfig.accessTokenSecretARN,
  refreshTokenPrivateKeySecretARN: environmentConfig.refreshTokenSecretARN,
  jwksTableName: environmentConfig.jwksTableName,
})({
  kidVersionStagePrefix: environmentConfig.kidVersionStagePrefix,
  kidVersionStagePrefixSeparator:
    environmentConfig.kidVersionStagePrefixSeparator,
  region: environmentConfig.region,
});

const result = await secretsProvisioner.provision();
