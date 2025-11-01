import { promises as fs } from 'fs';
import path from 'path';
import { renderAssessmentReport } from './report-template';
import { assessmentStore } from '@compliance/shared';

describe('renderAssessmentReport', () => {
  const templatePath = path.resolve(process.cwd(), 'apps/worker/templates/assessment-report.hbs');

  beforeAll(async () => {
    await fs.access(templatePath);
  });

  it('renders assessment data into the HTML template', async () => {
    const [assessment] = assessmentStore.list();
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
