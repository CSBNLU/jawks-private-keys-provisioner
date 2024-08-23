import { API } from "..";
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

interface Dependencies {
  privateKeySecretARN: string;
}

export interface Props {
  kidVersionStagePrefix: string;
  kidVersionStagePrefixSeparator: string;
  region: string;
}

export const create =
  (deps: Dependencies) =>
  (props: Props): API.PrivateKeyStore => {
    const { privateKeySecretARN } = deps;
    const { kidVersionStagePrefix, kidVersionStagePrefixSeparator, region } =
      props;
    const secretsManager = new SecretsManager({ region: region });
    return {
      retrieveLatestVersionCreationDate: async () => {
        try {
          const { Versions: versions } =
            await secretsManager.listSecretVersionIds({
              SecretId: privateKeySecretARN,
            });
          if (!versions) {
            return undefined;
          }
          const latestVersionCreationDate = versions
            .map((version) => version.CreatedDate)
            .filter((date) => date != undefined)
            .sort()
            .pop();

          return latestVersionCreationDate;
        } catch (error) {
          console.error(
            `Error retrieving latest version creation date: ${error}`,
          );
          return undefined;
        }
      },
      storeKey: async (props) => {
        const { privateKey, kid } = props;
        const versionStagePrefix = `${kidVersionStagePrefix}${kidVersionStagePrefixSeparator}`;

        const params = {
          SecretId: privateKeySecretARN,
          ClientRequestToken: kid,
          SecretString: privateKey,
          VersionStages: ["AWSCURRENT", `${versionStagePrefix}${kid}`],
        };
        await secretsManager.putSecretValue(params);
      },
    };
  };
