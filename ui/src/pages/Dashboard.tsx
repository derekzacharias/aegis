import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Open Findings',
    value: 42,
    description: 'Across 12 assessed assets',
    accent: '#ef4444',
  },
  {
    title: 'Waivers Expiring Soon',
    value: 5,
    description: 'Review within 14 days',
    accent: '#f97316',
  },
  {
    title: 'Evidence Ingested (30d)',
    value: 184,
    description: 'Automated and manual uploads',
    accent: '#22c55e',
  },
];

export default function Dashboard() {
  return (
    <div>
      <h2>Operational Overview</h2>
      <p style={{ color: '#475569', maxWidth: 540 }}>
        Track compliance posture across assets, assessments, and remediation jobs. Data shown here is
        synthetic to validate the UX prior to wiring backend services.
      </p>
      <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {cards.map((card) => (
          <article
            key={card.title}
            style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: 'white',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
              borderTop: `5px solid ${card.accent}`,
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>{card.title}</h3>
            <p style={{ fontSize: '2.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{card.value}</p>
            <p style={{ margin: 0, color: '#64748b' }}>{card.description}</p>
          </article>
        ))}
      </section>
      <section className="table-container" style={{ marginTop: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Recent Automation Jobs</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Stubbed sample entries from Chef InSpec and Ansible executions.</p>
          </div>
          <Link to="/delta" style={{ color: '#1d4ed8', fontWeight: 600 }}>
            View Delta Report
          </Link>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Framework</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>InSpec - Web Cluster 01</td>
              <td>DoD STIG</td>
              <td><span className="badge cat2">Completed</span></td>
              <td>17m</td>
            </tr>
            <tr>
              <td>Ansible Hardening - DB Nodes</td>
              <td>RMF Overlay</td>
              <td><span className="badge cat1">Changes Applied</span></td>
              <td>11m</td>
            </tr>
            <tr>
              <td>Nessus Import - DMZ Hosts</td>
              <td>CIS AWS</td>
              <td><span className="badge info">Queued</span></td>
              <td>--</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
