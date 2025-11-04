import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeltaReport from './pages/DeltaReport';

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/delta', label: 'Delta Report' },
];

export default function App() {
  return (
    <div>
      <header style={{ padding: '1rem 2rem', background: '#1d4ed8', color: 'white' }}>
        <h1 style={{ margin: 0 }}>AegisGRC</h1>
        <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
          {navigation.map((item) => (
            <Link key={item.to} to={item.to} style={{ color: 'white', fontWeight: 600 }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/delta" element={<DeltaReport />} />
        </Routes>
      </main>
    </div>
  );
}
