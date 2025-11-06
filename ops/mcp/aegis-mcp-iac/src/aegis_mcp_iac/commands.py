from __future__ import annotations

import asyncio
import json
import os
import shlex
import subprocess
from pathlib import Path
from typing import Iterable, Sequence

from .exceptions import ToolExecutionError


async def run_command(
    command: Sequence[str],
    *,
    cwd: str | Path | None = None,
    env: Iterable[tuple[str, str]] | None = None,
    input_data: str | None = None,
    expect_json: bool = False,
) -> dict | str:
    """
    Run a shell command asynchronously and return stdout (optionally parsed as JSON).

    Raises:
        ToolExecutionError: if the command exits with a non-zero status or JSON parsing fails.
    """

    cwd_path = Path(cwd).resolve() if cwd else None
    cmd_display = " ".join(shlex.quote(part) for part in command)

    def _execute() -> subprocess.CompletedProcess[str]:
        process_env = os.environ.copy()
        if env:
            process_env.update(dict(env))

        return subprocess.run(
            command,
            cwd=cwd_path,
            check=False,
            text=True,
            capture_output=True,
            input=input_data,
            env=process_env,
        )

    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, _execute)

    if result.returncode != 0:
        raise ToolExecutionError(
            f"Command failed ({cmd_display})",
            exit_code=result.returncode,
            stdout=result.stdout,
            stderr=result.stderr,
        )

    if expect_json:
        try:
            return json.loads(result.stdout or "{}")
        except json.JSONDecodeError as exc:
            raise ToolExecutionError(
                f"Failed to parse JSON output from command ({cmd_display})",
                exit_code=result.returncode,
                stdout=result.stdout,
                stderr=result.stderr,
            ) from exc

    return result.stdout
