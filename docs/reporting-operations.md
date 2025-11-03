## Report Rendering Operations

The report worker now renders FedRAMP-ready exports with hardened HTML templates, sandboxed Chromium, and durable artifact metadata. This document captures the runtime knobs and troubleshooting advice required to operate the renderer in production environments.

### Configuration Summary

| Variable | Default | Purpose |
| --- | --- | --- |
| `REPORT_BUCKET` | `local-reports` | Logical storage bucket recorded in artifact metadata. |
| `REPORT_RENDERER_MODE` | `ci` | `ci` enforces headless Chromium + sandbox, `local` enables DevTools and runs non-headless for debugging. |
| `REPORT_RENDERER_MAX_ATTEMPTS` | `3` | Retry count for transient rendering failures (timeouts, target-closed, connection resets). |
| `REPORT_RENDERER_RETRY_BACKOFF_MS` | `750` | Base backoff applied between retry attempts (multiplied by attempt number). |
| `REPORT_RENDERER_TIMEOUT_MS` | `90000` | Timeout applied to `page.setContent` and `page.pdf`. Set to `0` to disable. |
| `REPORT_RENDERER_LAUNCH_TIMEOUT_MS` | `45000` | Timeout while launching Chromium. |
| `REPORT_RENDERER_MAX_MEMORY_MB` | `512` | Injects `--js-flags=--max_old_space_size` to cap renderer heap usage. |
| `REPORT_RENDERER_ENABLE_SANDBOX` | `true` | Controls inclusion of `--no-sandbox` / `--disable-setuid-sandbox`. Keep `true` for FedRAMP workloads. |
| `REPORT_RENDERER_HEADLESS` | `null` | Override headless mode. Accepts `true`, `false`, or `shell` (legacy). |
| `REPORT_RENDERER_EXECUTABLE_PATH` | `null` | Absolute path to a system Chromium build when the bundled binary cannot be shipped. |
| `REPORT_RENDERER_DISABLE_DEV_SHM` | `true` | Adds `--disable-dev-shm-usage`; set `false` if `/dev/shm` is sufficiently sized. |
| `REPORT_RENDERER_EXTRA_ARGS` | `` | Comma-separated list of additional Chromium flags (e.g. `--remote-debugging-port=9222`). |
| `REPORT_RENDERER_FONTCONFIG_PATH` | `null` | When set, exported to Chromium `FONTCONFIG_PATH` to resolve custom font installations. |
| `REPORT_RENDERER_TEMPLATE_PATH` | `null` | Optional override of the default Handlebars template (must reside under `apps/worker/templates`). |

### Operational Notes

- **Metadata durability** – Each artifact stores schema version (`2024.10.1`), assessment ID, generated timestamp, bucket, media type, and byte length. Downstream consumers can rely on this metadata to detect schema changes or validate storage integrity.
- **Sandbox posture** – Production deployments should leave `REPORT_RENDERER_ENABLE_SANDBOX=true`. Only disable for constrained CI containers where user namespaces are unavailable. `REPORT_RENDERER_MODE=local` automatically disables sandboxing; do not propagate this to staging or production.
- **Chromium dependencies** – Ensure OS packages for headless Chromium (`libatk-1.0-0`, `libx11-xcb1`, `libcairo2`, `libpango-1.0-0`, `libgbm1`, `libnss3`, etc.) are installed. When shipping a custom Chromium build, set `REPORT_RENDERER_EXECUTABLE_PATH` and align `REPORT_RENDERER_EXTRA_ARGS` with platform requirements (e.g. `--single-process` on Alpine).
- **Font rendering** – Missing fonts in PDFs typically stem from minimal container images. Install the required font packages (e.g. `ttf-mscorefonts` or `fonts-liberation` for Segoe-like coverage) and point `REPORT_RENDERER_FONTCONFIG_PATH` to the directory that hosts `fonts.conf`.
- **Shared memory issues** – Errors mentioning `/dev/shm` exhaustion manifest as Chromium crashes. Increase shared memory allocation or set `REPORT_RENDERER_DISABLE_DEV_SHM=false` after verifying the host provides ample `/dev/shm` capacity.
- **Debug workflow** – Switch to `REPORT_RENDERER_MODE=local` to run Chromium with DevTools, no headless mode, and relaxed sandboxing. Pair with `REPORT_RENDERER_EXTRA_ARGS=--remote-debugging-port=9222` to inspect rendering logic.

### Troubleshooting Checklist

1. **Timeouts / `Target closed` errors** – Increase `REPORT_RENDERER_TIMEOUT_MS`, confirm the worker has sufficient CPU, and verify templates do not pull remote assets that hang.
2. **Blank PDFs or missing assets** – Ensure Handlebars helpers render sanitized data (worker strips scripts/inline events). If custom template overrides are required, keep them inside `apps/worker/templates` to pass the path guard.
3. **Font fallback** – Validate `FONTCONFIG_PATH` points to a directory containing `fonts.conf` and the desired `.ttf/.otf` files. Rebuild the container layer after installing fonts.
4. **Sandbox permission errors** – If running inside a restricted container (e.g., some CI runners), temporarily disable sandbox via `REPORT_RENDERER_ENABLE_SANDBOX=false`, but capture a risk acceptance before doing so in regulated environments.
5. **Memory pressure** – Adjust `REPORT_RENDERER_MAX_MEMORY_MB`. Chromium logs `Renderer process crashed` when the heap cap is reached; increase incrementally and monitor container limits.

For deeper debugging, run the dedicated worker test suite:

```bash
npx jest --config apps/worker/jest.config.ts apps/worker/src/workers/reporting.processor.spec.ts --runInBand
```

> **Note:** Nx `nx test worker` currently reports legacy `workspace.json` warnings; direct Jest invocation above bypasses that constraint.
