"""Unit tests for core.authentication.language."""

from django.test.utils import override_settings

import pytest

from core.authentication.language import compute_language, compute_stored_language


@pytest.mark.parametrize(
    "locale,expected",
    [
        ("nl", "nl-nl"),
        ("nl-NL", "nl-nl"),
        ("nl_NL", "nl-nl"),
        (" NL ", "nl-nl"),
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


@pytest.mark.parametrize(
    "locale,expected",
    [
        ("nl", "nl-nl"),
        ("nl_NL", "nl-nl"),
        ("es", "en-us"),  # well-formed but unsupported: default language
        ("pt-BR", "en-us"),
        ("und", None),
        ("*", None),
        ("-", None),
        ("x-foo", None),
        ("", None),
        ("   ", None),
        (None, None),
        (5, None),
        (["nl"], None),
    ],
)
def test_compute_stored_language(locale, expected):
    """Unsupported locales fall back to the default; malformed ones return None."""
    assert compute_stored_language({"sub": "abc", "locale": locale}) == expected


def test_compute_stored_language_missing_claim():
    """No "locale" claim at all leaves the stored language untouched."""
    assert compute_stored_language({"sub": "abc"}) is None


@override_settings(LANGUAGE_CODE="en")
def test_compute_stored_language_default_is_a_supported_code():
    """A bare LANGUAGE_CODE is mapped onto the matching settings.LANGUAGES code."""
    assert compute_stored_language({"locale": "es"}) == "en-us"
