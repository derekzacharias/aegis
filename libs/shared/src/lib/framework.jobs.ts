export const FRAMEWORK_PUBLISH_JOB = 'framework.publish';
export const FRAMEWORK_PUBLISH_REPORT_JOB = 'framework.publish.report';

export type FrameworkPublishActor = {
  userId: string;
  email?: string | null;
  name?: string | null;
};

export type FrameworkPublishJobPayload = {
  organizationId: string;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  publishedAt: string;
  actor: FrameworkPublishActor | null;
  attempt?: number;
};

export type FrameworkPublishReportPayload = {
  organizationId: string;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  publishedAt: string;
  actor: FrameworkPublishActor | null;
  attempt?: number;
};

export type FrameworkPublishJobResult = {
  frameworkId: string;
  organizationId: string;
  crosswalkMatches: number;
  controlCount: number;
  warmedAt: string;
  attempts: number;
};

export type FrameworkPublishReportResult = {
  frameworkId: string;
  organizationId: string;
  notifiedAt: string;
  assessmentsNotified: number;
  attempts: number;
};
