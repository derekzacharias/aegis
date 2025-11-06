import { Link } from 'react-router-dom';

const quickstartTracks = [
  {
    title: 'Kick-off Checklist',
    description: 'Authenticate, seed sample data, and review RBAC defaults before inviting collaborators.',
    action: 'Follow the quickstart →',
    anchor: '#quickstart',
  },
  {
    title: 'Automation Playbooks',
    description: 'Trigger Chef InSpec scans, enforce baselines with Ansible, and schedule verification jobs.',
    action: 'Browse automations →',
    anchor: '#automations',
  },
  {
    title: 'Reporting Guides',
    description: 'Publish assessments, export delta reports, and share auditor-ready evidence packets.',
    action: 'Visit reporting docs →',
    anchor: '#reporting',
  },
];

const guideCatalog = [
  {
    id: 'quickstart',
    heading: 'Getting started',
    eyebrow: 'Deploy with confidence',
    summary:
      'Stand up AegisGRC locally or in staging, wire service credentials, and validate the seeded demo workflows before onboarding additional teams.',
    items: [
      'Provision service users for automation agents and rotate credentials with refresh tokens.',
      'Run docker-compose to boot API, worker, and web clients; execute seed scripts for demo data.',
      'Review environment variable catalog and configure secrets in your preferred vault before production rollout.',
    ],
  },
  {
    id: 'automations',
    heading: 'Automation blueprints',
    eyebrow: 'Chef InSpec & Ansible',
    summary:
      'Design control coverage across scan, hardening, and validation phases. Each blueprint includes prerequisites, expected outcomes, and troubleshooting tips.',
    items: [
      'Chef InSpec scans: select profiles, map to assets, collect JSON artifacts, and normalize findings.',
      'Ansible remediation: run in check mode, capture drifts, enforce remediations, and trigger follow-up scans.',
      'Scheduler recipes: queue recurring compliance jobs, health checks, and notification digests.',
    ],
  },
  {
    id: 'reporting',
    heading: 'Reporting & evidence',
    eyebrow: 'Audit-ready outputs',
    summary:
      'Translate operational telemetry into executive-ready dashboards, compliance scorecards, and release note summaries for auditors.',
    items: [
      'Generate delta reports comparing control posture between scans with exportable CSV/PDF artifacts.',
      'Track evidence lifecycle: upload, antivirus scanning, approval, and reuse across frameworks.',
      'Capture remediation attestations, link policy updates, and document POA&Ms for audit context.',
    ],
  },
];

const lifecycle = [
  {
    phase: '01. Discover',
    title: 'Map your environment',
    detail:
      'Connect cloud accounts, inventory assets, and align them with baseline frameworks so future scans have clear scope.',
  },
  {
    phase: '02. Automate',
    title: 'Enforce continuously',
    detail:
      'Use orchestrated InSpec and Ansible jobs to assess drift, enforce configurations, and verify remediation steps automatically.',
  },
  {
    phase: '03. Report',
    title: 'Share outcomes',
    detail:
      'Distribute dashboards, delta reports, and evidence bundles that highlight compliance status across teams and time.',
  },
];

const resourceLinks = [
  {
    label: 'Release notes',
    description: 'Summaries for each platform iteration with upgrade guidance and migration tips.',
    href: '#release-notes',
  },
  {
    label: 'API reference',
    description: 'OpenAPI endpoints covering authentication, scans, findings, and remediation flows.',
    href: '#api-reference',
  },
  {
    label: 'Support playbook',
    description: 'Escalation paths, SLAs, and troubleshooting checklists for operations teams.',
    href: '#support',
  },
];

export default function Documentation() {
  return (
    <div className="documentation-page">
      <section className="documentation-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Documentation</p>
          <h2>Operational playbooks for AegisGRC</h2>
          <p>
            Explore the guides, automation runbooks, and reporting best practices that keep AegisGRC deployments audit-ready.
            Each section mirrors real implementation milestones so your team can move from proof-of-concept to production with
            confidence.
          </p>
          <div className="hero-actions">
            <Link to="/" className="primary-action">
              Return to dashboard
            </Link>
            <a className="secondary-action" href="#quickstart">
              Jump to quickstart
            </a>
          </div>
        </div>
        <div className="hero-panels">
          {quickstartTracks.map((track) => (
            <article key={track.title}>
              <header>
                <p className="panel-eyebrow">{track.title}</p>
                <h3>{track.description}</h3>
              </header>
              <a href={track.anchor} className="panel-action">
                {track.action}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="documentation-layout">
        <aside className="side-nav">
          <h4>Guide catalog</h4>
          <nav>
            <ul>
              {guideCatalog.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="guide-sections">
          {guideCatalog.map((section) => (
            <article key={section.id} id={section.id}>
              <p className="section-eyebrow">{section.eyebrow}</p>
              <div className="section-header">
                <h2>{section.heading}</h2>
                <p>{section.summary}</p>
              </div>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="lifecycle" id="release-notes">
        <header>
          <p className="section-eyebrow">Implementation milestones</p>
          <h2>Lifecycle roadmap</h2>
          <p>
            Track your deployment progress across discovery, automation, and reporting. Pair each milestone with structured
            logging, metrics, and alerts so stakeholders have clear visibility into compliance coverage.
          </p>
        </header>
        <div className="lifecycle-grid">
          {lifecycle.map((stage) => (
            <article key={stage.phase}>
              <p className="phase-label">{stage.phase}</p>
              <h3>{stage.title}</h3>
              <p>{stage.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="resource-grid" id="support">
        <header>
          <p className="section-eyebrow">Keep learning</p>
          <h2>Reference materials</h2>
        </header>
        <div className="resource-cards">
          {resourceLinks.map((resource) => (
            <article key={resource.label}>
              <h3>{resource.label}</h3>
              <p>{resource.description}</p>
              <a href={resource.href} className="panel-action">
                View details
              </a>
            </article>
          ))}
        </div>
        <div className="support-callout" id="api-reference">
          <h3>Need implementation help?</h3>
          <p>
            Open a support ticket with environment metadata, recent job IDs, and any error logs so our team can triage quickly.
            For production incidents, follow the 24/7 escalation runbook to reach the on-call engineer.
          </p>
          <Link to="/delta" className="primary-action">
            Review delta report workflow
          </Link>
        </div>
      </section>
    </div>
  );
}
