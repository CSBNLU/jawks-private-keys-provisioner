export interface SecretsProvisioner {
  provision: () => Promise<void>;
}
