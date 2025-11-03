export type TenantImpactLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface TenantProfile {
  organizationName: string;
  impactLevel: TenantImpactLevel;
  primaryContactEmail?: string | null;
  updatedAt: string;
}

export interface UpdateTenantProfileInput {
  organizationName: string;
  impactLevel: TenantImpactLevel;
  primaryContactEmail?: string | null;
}
