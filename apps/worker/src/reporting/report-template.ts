import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { AssessmentRecord } from '@compliance/shared';

const TEMPLATE_PATH = path.resolve(process.cwd(), 'apps/worker/templates/assessment-report.hbs');

interface ReportTemplateContext {
  assessment: AssessmentRecord;
  generatedAt: string;
  generatedBy: string;
  bucket: string;
}

let compiledTemplate: Handlebars.TemplateDelegate | null = null;

const registerHelpers = (() => {
  let registered = false;
  return () => {
    if (registered) {
      return;
    }
    Handlebars.registerHelper('formatDate', (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    });

    Handlebars.registerHelper('uppercase', (value: string) => value.toUpperCase());
    registered = true;
  };
})();

async function loadTemplate(): Promise<Handlebars.TemplateDelegate> {
  if (compiledTemplate) {
    return compiledTemplate;
  }

  registerHelpers();
  const contents = await fs.readFile(TEMPLATE_PATH, 'utf-8');
  compiledTemplate = Handlebars.compile(contents);
  return compiledTemplate;
}

export async function renderAssessmentReport(context: ReportTemplateContext): Promise<string> {
  const template = await loadTemplate();
  const viewModel = {
    ...context,
    frameworks: context.assessment.frameworkIds,
    progress: context.assessment.progress,
    generatedAtFormatted: new Date(context.generatedAt).toISOString()
  };

  return template(viewModel);
}
