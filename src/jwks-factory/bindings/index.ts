import { API } from "..";
import * as Implementation from "../implementation";

export const create = (): API.JWKSFactory => {
  const jwksFactory = Implementation.jwksFactory.create();

  return jwksFactory;
};
