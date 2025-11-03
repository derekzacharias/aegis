CIS Benchmark Agent Package
===========================

This package ships a lightweight evidence collection script (`cis_benchmark_agent.py`)
plus a helper installer. The script runs read-only checks that align with common CIS
benchmark controls:

- Password rotation policies from `/etc/login.defs`
- SSH root login hardening (`PermitRootLogin`)
- System services such as `sshd`, `firewalld`, `ufw`, and `auditd`
- Network forwarding posture (`net.ipv4.ip_forward`)

Usage
-----

1. Extract the archive:

   ```bash
   tar -xzf cis-benchmark-agent.tar.gz
   cd cis-benchmark-agent
   ```

2. (Optional) Install the agent into `/opt/cis-benchmark-agent`:

   ```bash
   sudo ./install.sh
   ```

   This copies the script to `/opt/cis-benchmark-agent` and prepares a reusable
   runner (`run-agent.sh`).

3. Run the collector. The script writes a timestamped JSON file to `./output`
   by default:

   ```bash
   python3 cis_benchmark_agent.py --pretty
   ```

   To target a specific directory:

   ```bash
   python3 cis_benchmark_agent.py --output-dir /var/tmp/cis-evidence
   ```

4. (Optional) Schedule recurring execution, for example via cron:

   ```bash
   sudo tee /etc/cron.d/cis-agent <<'CRON'
   15 * * * * root /opt/cis-benchmark-agent/run-agent.sh --output-dir /var/tmp/cis-evidence
   CRON
   ```

The resulting JSON artifacts include metadata for each check (status, evidence,
remediation guidance) so they can be uploaded to Aegis or reviewed manually.
