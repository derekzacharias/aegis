-- Example seed data for development environments
INSERT INTO profiles (id, name, description, framework, created_at, updated_at)
VALUES
  (1, 'DoD STIG - Linux', 'Sample STIG profile for Linux systems', 'STIG', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO assets (id, hostname, ip_address, platform, owner, created_at, updated_at)
VALUES
  (1, 'web-01.example.local', '10.0.0.10', 'linux', 'platform-team', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
