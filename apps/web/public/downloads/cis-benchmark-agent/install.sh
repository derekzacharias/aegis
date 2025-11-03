#!/usr/bin/env bash
set -euo pipefail

echo "CIS Benchmark Agent installer"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_ROOT="${1:-/opt/cis-benchmark-agent}"

echo "Installing to ${INSTALL_ROOT}"
mkdir -p "${INSTALL_ROOT}"

install -m 0644 "${SCRIPT_DIR}/cis_benchmark_agent.py" "${INSTALL_ROOT}/cis_benchmark_agent.py"
install -m 0644 "${SCRIPT_DIR}/README.txt" "${INSTALL_ROOT}/README.txt"

cat <<'WRAP' > "${INSTALL_ROOT}/run-agent.sh"
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "${SCRIPT_DIR}/cis_benchmark_agent.py" "$@"
WRAP

chmod +x "${INSTALL_ROOT}/run-agent.sh"

echo "Installed script:"
echo "  ${INSTALL_ROOT}/cis_benchmark_agent.py"
echo "Runner helper:"
echo "  ${INSTALL_ROOT}/run-agent.sh"
echo
echo "Example execution:"
echo "  sudo ${INSTALL_ROOT}/run-agent.sh --output-dir /var/tmp/cis-evidence --pretty"
