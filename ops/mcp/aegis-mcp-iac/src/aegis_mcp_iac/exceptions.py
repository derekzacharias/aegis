class ToolExecutionError(RuntimeError):
    """Raised when an external command fails during tool execution."""

    def __init__(self, message: str, *, exit_code: int | None = None, stdout: str = "", stderr: str = "") -> None:
        super().__init__(message)
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr


class InvalidInputError(ValueError):
    """Raised when required tool inputs are missing or malformed."""

