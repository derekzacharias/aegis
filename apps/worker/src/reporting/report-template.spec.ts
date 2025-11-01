import { promises as fs } from 'fs';
import path from 'path';
import { renderAssessmentReport } from './report-template';
import { AssessmentSummary } from '@compliance/shared';

describe('renderAssessmentReport', () => {
  const templatePath = path.resolve(process.cwd(), 'apps/worker/templates/assessment-report.hbs');

  beforeAll(async () => {
    await fs.access(templatePath);
  });

  it('renders assessment data into the HTML template', async () => {
    const assessment: AssessmentSummary = {
      id: 'assessment-1',
      name: 'FedRAMP Moderate Baseline Readiness',
      frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
      status: 'in-progress',
      owner: 'compliance-team@example.com',
      createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
      updatedAt: new Date('2024-02-28T23:30:00Z').toISOString(),
      progress: {
        satisfied: 142,
        partial: 98,
        unsatisfied: 34,
        total: 310
      }
    };
    const html = await renderAssessmentReport({
      assessment,
      generatedAt: new Date('2024-03-01T12:00:00Z').toISOString(),
      generatedBy: 'reports@example.com',
      bucket: 'local-reports'
    });

    expect(html).toContain(assessment.name);
    expect(html).toContain(assessment.owner);
    expect(html).toContain('FedRAMP');
    expect(html).toContain('local-reports');
    expect(html).toContain(assessment.progress.total.toString());
  });
});
