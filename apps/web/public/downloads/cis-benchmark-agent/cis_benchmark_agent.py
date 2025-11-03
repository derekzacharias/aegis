#!/usr/bin/env python3
"""Lightweight CIS benchmark evidence collector.

This script gathers basic hardening signals from a Linux host and prepares
structured output that can be uploaded to the Aegis API or reviewed manually.
It focuses on read-only checks so it can run in restricted environments.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import platform
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional

AGENT_VERSION = "0.1.0"
DEFAULT_SERVICES = ["sshd", "firewalld", "ufw", "auditd"]
LOGIN_DEFS_PATH = Path("/etc/login.defs")
SSHD_CONFIG_PATH = Path("/etc/ssh/sshd_config")
SYSCTL_PATH = Path("/etc/sysctl.conf")


@dataclass
class CheckResult:
  """Represents a single CIS-aligned control check."""

  control_id: str
  status: str
  title: str
  description: str
  remediation: str
  evidence: Dict[str, object]


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="Collect CIS benchmark signals")
  parser.add_argument(
    "--output-dir",
    type=Path,
    default=Path.cwd() / "output",
    help="Directory where the evidence bundle will be written",
  )
  parser.add_argument(
    "--services",
    nargs="*",
    default=DEFAULT_SERVICES,
    help="Additional services to validate (defaults: sshd firewalld ufw auditd)",
  )
  parser.add_argument(
    "--pretty",
    action="store_true",
    help="Write JSON with indentation for human review",
  )
  return parser.parse_args()


def run_command(command: List[str], timeout: int = 10) -> subprocess.CompletedProcess[str]:
  """Execute a command defensively, capturing output."""
  if shutil.which(command[0]) is None:
    raise FileNotFoundError(command[0])
  return subprocess.run(
    command,
    text=True,
    check=False,
    capture_output=True,
    timeout=timeout,
  )


def collect_os_release() -> Dict[str, str]:
  data: Dict[str, str] = {}
  os_release_path = Path("/etc/os-release")
  if os_release_path.exists():
    for line in os_release_path.read_text().splitlines():
      if "=" in line:
        key, value = line.split("=", 1)
        data[key] = value.strip('"')
  return data


def collect_sysctl_flags(keys: List[str]) -> Dict[str, Optional[str]]:
  result: Dict[str, Optional[str]] = {key: None for key in keys}
  for key in keys:
    try:
      proc = run_command(["sysctl", key])
      if proc.returncode == 0:
        _, value = proc.stdout.strip().split("=", 1)
        result[key] = value.strip()
    except (FileNotFoundError, ValueError, subprocess.SubprocessError):
      # Fall back to manual parsing if sysctl binary is missing or fails.
      result[key] = parse_sysctl_conf().get(key)
  return result


def parse_sysctl_conf() -> Dict[str, str]:
  values: Dict[str, str] = {}
  if SYSCTL_PATH.exists():
    for line in SYSCTL_PATH.read_text().splitlines():
      line = line.strip()
      if not line or line.startswith("#") or "=" not in line:
        continue
      key, value = line.split("=", 1)
      values[key.strip()] = value.strip()
  return values


def parse_login_defs() -> Dict[str, str]:
  settings: Dict[str, str] = {}
  if LOGIN_DEFS_PATH.exists():
    for line in LOGIN_DEFS_PATH.read_text().splitlines():
      line = line.strip()
      if not line or line.startswith("#"):
        continue
      parts = line.split()
      if len(parts) >= 2:
        settings[parts[0]] = parts[1]
  return settings


def read_sshd_config() -> Dict[str, str]:
  config: Dict[str, str] = {}
  if SSHD_CONFIG_PATH.exists():
    pattern = re.compile(r"^(?P<key>\S+)\s+(?P<value>.+)$")
    for raw_line in SSHD_CONFIG_PATH.read_text().splitlines():
      line = raw_line.strip()
      if not line or line.startswith("#"):
        continue
      match = pattern.match(line)
      if match:
        key = match.group("key").lower()
        value = match.group("value").split()[0]
        config[key] = value
  return config


def collect_system_metadata() -> Dict[str, object]:
  return {
    "hostname": platform.node(),
    "platform": platform.platform(),
    "kernel": platform.release(),
    "architecture": platform.machine(),
    "os_release": collect_os_release(),
  }


def check_password_rotation(login_defs: Dict[str, str]) -> List[CheckResult]:
  results: List[CheckResult] = []
  expectations = {
    "PASS_MAX_DAYS": ("<=", 365, "Limit maximum password age to 365 days"),
    "PASS_MIN_DAYS": (">=", 1, "Set minimum password age to at least 1 day"),
    "PASS_WARN_AGE": (">=", 7, "Warn users at least 7 days before password expiry"),
  }
  for key, (operator, target, title) in expectations.items():
    raw_value = login_defs.get(key)
    evidence = {"observed": raw_value, "expected": f"{operator} {target}"}
    if raw_value is None:
      status = "unknown"
      description = f"{key} not defined in {LOGIN_DEFS_PATH}"
    else:
      try:
        value = int(raw_value)
      except ValueError:
        status = "fail"
        description = f"{key} is not an integer"
      else:
        if operator == "<=" and value <= target:
          status = "pass"
          description = f"{key} meets policy"
        elif operator == ">=" and value >= target:
          status = "pass"
          description = f"{key} meets policy"
        else:
          status = "fail"
          description = f"{key} is outside recommended bounds"
    results.append(
      CheckResult(
        control_id=f"cis-password-policy-{key.lower()}",
        status=status,
        title=title,
        description=description,
        remediation=f"Update {LOGIN_DEFS_PATH} so that {key} {expectations[key][0]} {expectations[key][1]}.",
        evidence=evidence,
      )
    )
  return results


def check_root_login(config: Dict[str, str]) -> CheckResult:
  value = config.get("permitrootlogin")
  evidence = {"observed": value, "expected": "prohibit-password or no"}
  if value is None:
    status = "unknown"
    description = f"PermitRootLogin not configured in {SSHD_CONFIG_PATH}"
  elif value.lower() in {"no", "prohibit-password"}:
    status = "pass"
    description = "Root login over SSH is disabled"
  else:
    status = "fail"
    description = "Root login remains enabled"
  return CheckResult(
    control_id="cis-ssh-permit-root-login",
    status=status,
    title="Disable direct root SSH access",
    description=description,
    remediation="Set PermitRootLogin to 'prohibit-password' or 'no' in sshd_config and reload sshd.",
    evidence=evidence,
  )


def check_service_state(services: List[str]) -> List[CheckResult]:
  results: List[CheckResult] = []
  systemctl_available = shutil.which("systemctl") is not None
  for service in services:
    status = "unknown"
    description = "Service not evaluated"
    evidence: Dict[str, Optional[str]] = {"service": service}
    if systemctl_available:
      try:
        active_proc = run_command(["systemctl", "is-active", service])
        enabled_proc = run_command(["systemctl", "is-enabled", service])
        evidence.update(
          {
            "is_active": active_proc.stdout.strip(),
            "is_enabled": enabled_proc.stdout.strip(),
          }
        )
        if active_proc.returncode == 0 and enabled_proc.returncode == 0:
          status = "pass"
          description = "Service active and enabled"
        else:
          status = "fail"
          description = "Service inactive or disabled"
      except (FileNotFoundError, subprocess.SubprocessError) as exc:
        evidence["error"] = str(exc)
    else:
      # Fallback: try legacy service command
      try:
        proc = run_command(["service", service, "status"])
        evidence["service_status_output"] = proc.stdout.strip()
        status = "pass" if proc.returncode == 0 else "fail"
        description = "Legacy service status command returned zero" if status == "pass" else "Service status command failed"
      except (FileNotFoundError, subprocess.SubprocessError) as exc:
        evidence["error"] = str(exc)
    results.append(
      CheckResult(
        control_id=f"cis-service-{service}",
        status=status,
        title=f"Ensure {service} is running where required",
        description=description,
        remediation="Enable and start the service or remove it from the monitored list if not applicable.",
        evidence=evidence,
      )
    )
  return results


def check_ip_forwarding(sysctl_values: Dict[str, Optional[str]]) -> CheckResult:
  value = sysctl_values.get("net.ipv4.ip_forward")
  evidence = {"observed": value, "expected": "0"}
  if value is None:
    status = "unknown"
    description = "net.ipv4.ip_forward not defined"
  elif value == "0":
    status = "pass"
    description = "IPv4 forwarding disabled"
  else:
    status = "fail"
    description = "IPv4 forwarding enabled"
  return CheckResult(
    control_id="cis-sysctl-ip-forwarding",
    status=status,
    title="Disable IP forwarding",
    description=description,
    remediation="Set net.ipv4.ip_forward=0 via sysctl and apply with sysctl -w or reboot.",
    evidence=evidence,
  )


def build_payload(checks: List[CheckResult]) -> Dict[str, object]:
  collected_at = dt.datetime.utcnow().replace(tzinfo=dt.timezone.utc).isoformat()
  return {
    "agent": {
      "name": "cis-benchmark-agent",
      "version": AGENT_VERSION,
      "collected_at": collected_at,
      "python": sys.version,
    },
    "system": collect_system_metadata(),
    "checks": [asdict(check) for check in checks],
  }


def write_output(payload: Dict[str, object], output_dir: Path, pretty: bool) -> Path:
  output_dir.mkdir(parents=True, exist_ok=True)
  timestamp = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
  output_path = output_dir / f"cis_evidence_{timestamp}.json"
  with output_path.open("w", encoding="utf-8") as handle:
    json.dump(payload, handle, indent=2 if pretty else None, sort_keys=pretty)
  return output_path


def main() -> int:
  args = parse_args()

  login_defs = parse_login_defs()
  sshd_config = read_sshd_config()
  sysctl_keys = ["net.ipv4.ip_forward"]
  sysctl_values = collect_sysctl_flags(sysctl_keys)

  checks: List[CheckResult] = []
  checks.extend(check_password_rotation(login_defs))
  checks.append(check_root_login(sshd_config))
  checks.extend(check_service_state(args.services))
  checks.append(check_ip_forwarding(sysctl_values))

  payload = build_payload(checks)
  output_path = write_output(payload, args.output_dir, args.pretty)

  print(f"Evidence bundle written to {output_path}")
  return 0


if __name__ == "__main__":
  sys.exit(main())
