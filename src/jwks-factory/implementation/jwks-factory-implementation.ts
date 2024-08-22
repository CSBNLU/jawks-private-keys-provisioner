import { API } from "..";
import { generateKey } from "./generateKey";

export const create = (): API.JWKSFactory => {
  return {
    create: async () => {
      // 1. Generate a new key pair for the access token
      const accessTokenKey = await generateKey("AccessToken");

      // 2. Generate a new key pair for the refresh token
      const refreshTokenKey = await generateKey("RefreshToken");

      return { accessToken: accessTokenKey, refreshToken: refreshTokenKey };
    },
  };
};
