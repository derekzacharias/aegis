import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Automated Compliance Workflows',
    description:
      'Trigger Chef InSpec scans, Ansible hardening, and evidence ingestion from a single orchestration plane with guardrails baked in.',
  },
  {
    title: 'Actionable Dashboards',
    description:
      'Visualize control health, framework coverage, and remediation velocity so analysts can prioritize the riskiest gaps first.',
  },
  {
    title: 'Collaboration Ready',
    description:
      'Share context across security, compliance, and engineering teams with audit trails, policy approvals, and service user guidance.',
  },
];

const guideSections = [
  {
    heading: 'Why AegisGRC',
    items: [
      'Normalize scan and ticket data into a common controls language.',
      'Map evidence to frameworks with reusable crosswalks and AI suggestions.',
      'Track remediation jobs with automated verification scans.',
    ],
  },
  {
    heading: 'Key Benefits',
    items: [
      'Security-first defaults: RBAC, JWT auth, encrypted storage, and audit-ready logs.',
      'Operational clarity: structured job telemetry, health monitors, and scheduler insights.',
      'Confidence at scale: idempotent automations with retry logic and guardrails for infrastructure changes.',
    ],
  },
  {
    heading: 'Compass for Implementation',
    items: [
      'Start with seeded frameworks and assessments, then tailor controls to your mission needs.',
      'Connect Chef InSpec, Ansible, and evidence sources from Integrations → Automation Agents.',
      'Promote compliant baselines through the Delta Report to prove risk reduction over time.',
    ],
  },
];

const resourceLinks = [
  { label: 'Integration Playbooks', to: '/docs/integrations' },
  { label: 'Scheduler Deep Dive', to: '/docs/scheduler' },
  { label: 'Policy Automation Guides', to: '/docs/policies' },
];

export default function Documentation() {
  return (
    <div className="documentation-page">
      <section className="documentation-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Documentation</p>
          <h2>Build on AegisGRC with confidence</h2>
          <p>
            Use these guides to configure automation agents, wire integrations, and prove compliance posture to leadership.
            Every article is grounded in production scenarios so your team can get started quickly and scale securely.
          </p>
          <div className="hero-actions">
            <Link to="/" className="primary-action">
              View Dashboard
            </Link>
            <a className="secondary-action" href="#guides">
              Explore Guides
            </a>
          </div>
        </div>
        <div className="hero-highlights">
          {highlights.map((highlight) => (
            <article key={highlight.title}>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="guides" className="documentation-content">
        {guideSections.map((section) => (
          <article key={section.heading}>
            <header>
              <h3>{section.heading}</h3>
            </header>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="documentation-footer">
        <div>
          <h3>More resources</h3>
          <p>
            Keep exploring the platform capabilities with our deep dives, sample data walkthroughs, and automation checklists.
            Each guide is updated alongside product releases, so bookmark the docs hub and subscribe to release notes.
          </p>
        </div>
        <nav>
          {resourceLinks.map((resource) => (
            <a key={resource.label} href={resource.to}>
              {resource.label}
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}
