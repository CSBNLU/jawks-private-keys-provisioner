import { API } from "..";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { JWK } from "jose";
import { z } from "zod";

export interface Dependencies {}

export interface Props {
  region: string;
  tableName: string;
}

export const create =
  (deps: Dependencies) =>
  (props: Props): API.JWKSRepository => {
    const { region, tableName } = props;

    return {
      store: async (props: { jwks: JWK[] }): Promise<void> => {
        const dynamodb = new DynamoDBClient({ region });
        const documentClient = DynamoDBDocumentClient.from(dynamodb);

        const jwkSchema = z.object({
          kty: z.literal("EC"),
          crv: z.literal("P-521"),
          x: z.string(),
          y: z.string(),
          d: z.string().optional(),
          use: z.literal("sig"),
          alg: z.literal("ES512"),
          kid: z.string(),
        });

        const { jwks } = props;

        const parsedJWKs = jwks.map((jwk) => jwkSchema.parse(jwk));

        const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 210; // 210 days
        const items = parsedJWKs.map((jwk) => ({
          pk: jwk.kid,
          kty: jwk.kty,
          crv: jwk.crv,
          x: jwk.x,
          y: jwk.y,
          d: jwk.d,
          use: jwk.use,
          alg: jwk.alg,
          kid: jwk.kid,
          expires_at: expiresAt.toString(),
          delete_at: expiresAt / 1000,
        }));

        const command = new BatchWriteCommand({
          RequestItems: {
            [tableName]: items.map((item) => ({
              PutRequest: {
                Item: item,
              },
            })),
          },
        });
        await documentClient.send(command);
      },
    };
  };
