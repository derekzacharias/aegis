import type { JSX } from 'react';
import { useMemo, useState } from 'react';

type FindingRow = {
  ruleId: string;
  before: string | null;
  after: string | null;
  severity: 'CAT_I' | 'CAT_II' | 'CAT_III' | 'INFO';
  family: string;
  trend: number[];
};

const sampleRows: FindingRow[] = [
  {
    ruleId: 'V-12345',
    before: 'open',
    after: 'not_a_finding',
    severity: 'CAT_I',
    family: 'AC',
    trend: [9, 8, 5, 3, 1],
  },
  {
    ruleId: 'V-67890',
    before: 'not_a_finding',
    after: 'open',
    severity: 'CAT_II',
    family: 'CM',
    trend: [2, 2, 3, 4, 5],
  },
  {
    ruleId: 'V-54321',
    before: null,
    after: 'review_required',
    severity: 'CAT_III',
    family: 'SI',
    trend: [0, 1, 1, 1, 1],
  },
];

const severityLabels: Record<FindingRow['severity'], string> = {
  CAT_I: 'CAT I',
  CAT_II: 'CAT II',
  CAT_III: 'CAT III',
  INFO: 'Informational',
};

export default function DeltaReport() {
  const [severity, setSeverity] = useState<string>('all');
  const [family, setFamily] = useState<string>('all');

  const filteredRows = useMemo(() => {
    return sampleRows.filter((row) => {
      const severityMatch = severity === 'all' || row.severity === severity;
      const familyMatch = family === 'all' || row.family === family;
      return severityMatch && familyMatch;
    });
  }, [severity, family]);

  return (
    <div>
      <h2>Delta Report</h2>
      <p style={{ color: '#475569', maxWidth: 560 }}>
        Compare baseline and remediation assessment results. This mock view demonstrates table layout, filtering, and mini
        trend charts. Integrating with the FastAPI delta endpoint will populate real data.
      </p>
      <div className="filter-bar">
        <label>
          Severity
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="all">All severities</option>
            <option value="CAT_I">CAT I</option>
            <option value="CAT_II">CAT II</option>
            <option value="CAT_III">CAT III</option>
            <option value="INFO">Informational</option>
          </select>
        </label>
        <label>
          Control Family
          <select value={family} onChange={(event) => setFamily(event.target.value)}>
            <option value="all">All families</option>
            <option value="AC">AC - Access Control</option>
            <option value="CM">CM - Configuration Management</option>
            <option value="SI">SI - System and Information Integrity</option>
          </select>
        </label>
      </div>
      <section className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Control</th>
              <th>Severity</th>
              <th>Before</th>
              <th>After</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.ruleId}>
                <td>
                  <strong>{row.ruleId}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Family {row.family}</div>
                </td>
                <td>
                  <span className={`badge ${badgeClass(row.severity)}`}>{severityLabels[row.severity]}</span>
                </td>
                <td>{formatStatus(row.before)}</td>
                <td>{formatStatus(row.after)}</td>
                <td>
                  <div className="trend">
                    {row.trend.map((value, index) => (
                      <span key={index} style={{ height: `${Math.max(value, 1) * 8}px` }} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No findings match the selected filters.
          </p>
        )}
      </section>
    </div>
  );
}

function formatStatus(status: string | null): JSX.Element | string {
  if (!status) return <span style={{ color: '#94a3b8' }}>Not assessed</span>;
  const label = status.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function badgeClass(severity: FindingRow['severity']) {
  switch (severity) {
    case 'CAT_I':
      return 'cat1';
    case 'CAT_II':
      return 'cat2';
    case 'CAT_III':
      return 'cat3';
    default:
      return 'info';
  }
}
