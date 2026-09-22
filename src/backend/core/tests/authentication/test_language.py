"""Unit tests for core.authentication.language."""

import pytest

from core.authentication.language import compute_language


@pytest.mark.parametrize(
    "locale,expected",
    [
        ("nl", "nl-nl"),
        ("nl-NL", "nl-nl"),
        ("en-US", "en-us"),
        ("de", "de-de"),
        ("es", None),  # not a supported language
        ("", None),
        (None, None),
    ],
)
def test_compute_language(locale, expected):
    """compute_language() maps a BCP47 "locale" claim to a supported language code."""
    assert compute_language({"locale": locale}) == expected


def test_compute_language_non_string_claim():
    """A non-string "locale" claim is rejected rather than crashing."""
    assert compute_language({"locale": ["nl"]}) is None


def test_compute_language_missing_claim():
    """No "locale" claim at all resolves to None, not a KeyError."""
    assert compute_language({}) is None
