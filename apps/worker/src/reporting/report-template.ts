import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { AssessmentSummary } from '@compliance/shared';

const TEMPLATE_ROOT = path.resolve(process.cwd(), 'apps/worker/templates');
const DEFAULT_TEMPLATE = path.join(TEMPLATE_ROOT, 'assessment-report.hbs');

interface ReportTemplateContext {
  assessment: AssessmentSummary;
  generatedAt: string;
  generatedBy: string;
  bucket: string;
}

interface RenderOptions {
  templatePath?: string;
}

const templateCache = new Map<string, Handlebars.TemplateDelegate>();

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

function ensureTemplatePath(templatePath?: string): string {
  const candidate = templatePath ? path.resolve(templatePath) : DEFAULT_TEMPLATE;
  if (!candidate.startsWith(TEMPLATE_ROOT)) {
    throw new Error(`Template path ${candidate} is outside of template root ${TEMPLATE_ROOT}`);
  }
  return candidate;
}

function sanitizeString(value: string): string {
  const withoutControlChars = value.replace(/[\u0000-\u001f\u007f]/g, '');
  const strippedDangerousTokens = withoutControlChars.replace(
    /<\/?script\b[^>]*>|javascript:|on\w+\s*=|<\/?iframe\b[^>]*>/gi,
    ''
  );
  return strippedDangerousTokens.slice(0, 10_000);
}

function sanitizeContext<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((value) => sanitizeContext(value)) as unknown as T;
  }

  if (input && typeof input === 'object') {
    const entries = Object.entries(input as Record<string, unknown>).map(([key, value]) => [
      key,
      sanitizeContext(value)
    ]);
    return Object.fromEntries(entries) as unknown as T;
  }

  return input;
}

async function loadTemplate(templatePath?: string): Promise<Handlebars.TemplateDelegate> {
  const resolvedTemplate = ensureTemplatePath(templatePath);
  const cached = templateCache.get(resolvedTemplate);
  if (cached) {
    return cached;
  }
  registerHelpers();
  const contents = await fs.readFile(resolvedTemplate, 'utf-8');
  const compiled = Handlebars.compile(contents, {
    strict: true,
    preventIndent: true,
    noEscape: false
  });
  templateCache.set(resolvedTemplate, compiled);
  return compiled;
}

export async function renderAssessmentReport(
  context: ReportTemplateContext,
  options?: RenderOptions
): Promise<string> {
  const sanitizedContext = sanitizeContext(context);
  const template = await loadTemplate(options?.templatePath);
  const viewModel = {
    ...sanitizedContext,
    frameworks: sanitizedContext.assessment.frameworkIds,
    progress: sanitizedContext.assessment.progress,
    generatedAtFormatted: new Date(sanitizedContext.generatedAt).toISOString()
  };

  return template(viewModel);
}
