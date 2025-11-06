from __future__ import annotations

from typing import Any, Iterable, Sequence


def ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def statement_has_wildcard(statement: dict[str, Any]) -> bool:
    actions = ensure_list(statement.get("Action"))
    resources = ensure_list(statement.get("Resource"))

    if any(_is_wildcard(action) for action in actions):
        return True

    return any(_is_wildcard(resource) for resource in resources)


def _is_wildcard(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    return value in {"*", "*:*"} or value.endswith(":*")


def flatten(items: Iterable[Sequence[Any]]) -> list[Any]:
    flattened: list[Any] = []
    for item in items:
        flattened.extend(item)
    return flattened
