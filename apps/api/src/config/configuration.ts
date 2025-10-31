export default () => ({
  environment: process.env['NODE_ENV'] ?? 'development',
  port: Number(process.env['PORT'] ?? 3333),
  databaseUrl: process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/compliance',
  jwtSecret: process.env['JWT_SECRET'] ?? 'change-me',
  storageBucket: process.env['EVIDENCE_BUCKET'] ?? 'local-evidence'
});
