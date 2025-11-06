class AWSToolError(RuntimeError):
    """Raised when AWS SDK calls fail during tool execution."""

    def __init__(self, message: str, *, service: str | None = None) -> None:
        super().__init__(message)
        self.service = service


class ToolExecutionError(RuntimeError):
    """Raised when an external command (Prowler, Steampipe) fails."""

    def __init__(self, message: str, *, exit_code: int | None = None, stdout: str = "", stderr: str = "") -> None:
        super().__init__(message)
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr
