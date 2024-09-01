#!/usr/bin/env bun

import { Bindings } from "../private-keys-provisioner/index.js";
import { z } from "zod";

const constants = Object.freeze({
  defaultPrivateKeysRefreshIntervalInDays: 200,
});

interface RawEnvironmentConfig {
  accessTokenSecretARN: string;
  refreshTokenSecretARN: string;
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  region: string;
  jwksTableName: string;
  privateKeysRefreshIntervalInDays?: string;
}

interface EnvironmentConfig {
  accessTokenSecretARN: string;
  refreshTokenSecretARN: string;
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  region: string;
  jwksTableName: string;
  privateKeysRefreshIntervalInDays?: number;
}

const environmentConfigSchema = z.object({
  accessTokenSecretARN: z.string(),
  refreshTokenSecretARN: z.string(),
  kidVersionStagePrefix: z.string(),
  kidVersionStagePrefixSeparator: z.string(),
  region: z.string(),
  jwksTableName: z.string(),
  privateKeysRefreshIntervalInDays: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      const parsedValue = parseInt(value);
      if (isNaN(parsedValue)) {
        console.error("Invalid privateKeysRefreshIntervalInDays");
        return undefined;
      }
      return parsedValue;
    }),
});

const rawEnvironmentConfig: RawEnvironmentConfig = {
  accessTokenSecretARN: process.env.ACCESS_TOKEN_SECRET_ARN as string,
  refreshTokenSecretARN: process.env.REFRESH_TOKEN_SECRET_ARN as string,
  kidVersionStagePrefix: process.env.KID_VERSION_STAGE_PREFIX as string,
  kidVersionStagePrefixSeparator: process.env
    .KID_VERSION_STAGE_PREFIX_SEPARATOR as string,
  region: process.env.REGION as string,
  jwksTableName: process.env.TABLE_NAME as string,
  privateKeysRefreshIntervalInDays: process.env
    .PRIVATE_KEYS_REFRESH_INTERVAL_IN_DAYS as string | undefined,
};

const environmentConfig: EnvironmentConfig =
  environmentConfigSchema.parse(rawEnvironmentConfig);

console.log(JSON.stringify(environmentConfig));

const secretsProvisioner = Bindings.create({
  accessTokenPrivateKeySecretARN: environmentConfig.accessTokenSecretARN,
  refreshTokenPrivateKeySecretARN: environmentConfig.refreshTokenSecretARN,
  jwksTableName: environmentConfig.jwksTableName,
})({
  kidVersionStagePrefix: environmentConfig.kidVersionStagePrefix,
  kidVersionStagePrefixSeparator:
    environmentConfig.kidVersionStagePrefixSeparator,
  privateKeysRefreshIntervalInDays:
    environmentConfig.privateKeysRefreshIntervalInDays ??
    constants.defaultPrivateKeysRefreshIntervalInDays,
  region: environmentConfig.region,
});

const result = await secretsProvisioner.provision();
