export interface PrivateKeyStore {
  retrieveLatestVersionCreationDate: () => Promise<Date | undefined>;
  storeKey: (props: { privateKey: string; kid: string }) => Promise<void>;
}
