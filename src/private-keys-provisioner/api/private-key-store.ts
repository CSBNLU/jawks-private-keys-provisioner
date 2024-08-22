export interface PrivateKeyStore {
  storeKey: (props: { privateKey: string; kid: string }) => Promise<void>;
}
