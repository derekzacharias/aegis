export type AntivirusAutoReleaseStrategy = 'manual' | 'pending' | 'previous';

export interface AntivirusSettingsView {
  autoReleaseStrategy: AntivirusAutoReleaseStrategy;
  updatedAt: string | null;
}

export interface UpdateAntivirusSettingsInput {
  autoReleaseStrategy: AntivirusAutoReleaseStrategy;
}
