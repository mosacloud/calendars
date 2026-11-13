"""Tests for TranslationService."""

import json
from datetime import datetime

from django.conf import settings
from django.test import RequestFactory, override_settings

import pytest

from core import factories
from core.services.translation_service import SUPPORTED_LANGUAGES, TranslationService


def test_supported_languages_match_the_translations():
    """SUPPORTED_LANGUAGES lists the languages of translations.json."""
    with open(settings.TRANSLATIONS_JSON_PATH, encoding="utf-8") as f:
        assert set(SUPPORTED_LANGUAGES) == set(json.load(f))


class TestTranslationServiceLookup:  # pylint: disable=missing-function-docstring
    """Tests for key lookup and interpolation."""

    def test_lookup_french_key(self):
        value = TranslationService.t("email.subject.invitation", "fr", summary="Test")
        assert value == "Invitation : Test"

    def test_lookup_english_key(self):
        value = TranslationService.t("email.subject.invitation", "en", summary="Test")
        assert value == "Invitation: Test"

    def test_lookup_dutch_key(self):
        value = TranslationService.t("email.subject.cancel", "nl", summary="Test")
        assert value == "Geannuleerd: Test"

    def test_lookup_german_key(self):
        value = TranslationService.t("email.subject.invitation", "de", summary="Test")
        assert value == "Einladung: Test"

    def test_fallback_to_english(self):
        """If key is missing in requested lang, falls back to English."""
        value = TranslationService.t("email.noTitle", "en")
        assert value == "(No title)"

    def test_fallback_to_key_if_missing(self):
        """If key is missing everywhere, returns the key itself."""
        value = TranslationService.t("nonexistent.key", "fr")
        assert value == "nonexistent.key"

    def test_interpolation_multiple_vars(self):
        value = TranslationService.t("email.invitation.body", "en", organizer="Alice")
        assert "Alice" in value

    def test_rsvp_keys(self):
        assert "accepted" in TranslationService.t("rsvp.accepted", "en").lower()
        assert "accepté" in TranslationService.t("rsvp.accepted", "fr").lower()
        assert "angenommen" in TranslationService.t("rsvp.accepted", "de").lower()

    def test_error_keys(self):
        value = TranslationService.t("rsvp.error.eventPast", "fr")
        assert "passé" in value


class TestNormalizeLang:  # pylint: disable=missing-function-docstring
    """Tests for language normalization."""

    def test_normalize_fr_fr(self):
        assert TranslationService.normalize_lang("fr-fr") == "fr"

    def test_normalize_en_us(self):
        assert TranslationService.normalize_lang("en-us") == "en"

    def test_normalize_nl_nl(self):
        assert TranslationService.normalize_lang("nl-nl") == "nl"

    def test_normalize_de_de(self):
        assert TranslationService.normalize_lang("de-de") == "de"

    def test_normalize_simple(self):
        assert TranslationService.normalize_lang("fr") == "fr"

    def test_normalize_unknown_falls_back_to_default(self):
        """Unknown codes fall back to the LANGUAGE_CODE-derived default."""
        assert TranslationService.normalize_lang("es") == "en"

    def test_normalize_empty(self):
        """Empty codes fall back to the LANGUAGE_CODE-derived default."""
        assert TranslationService.normalize_lang("") == "en"

    @override_settings(LANGUAGE_CODE="nl-nl")
    def test_normalize_fallback_respects_language_code(self):
        """The fallback follows the deployment's LANGUAGE_CODE setting."""
        assert TranslationService.normalize_lang("es") == "nl"
        assert TranslationService.normalize_lang("") == "nl"


class TestFormatDate:
    """Tests for date formatting."""

    def test_format_date_french(self):
        """Format date in French locale."""
        dt = datetime(2026, 1, 23, 10, 0)  # Friday
        result = TranslationService.format_date(dt, "fr")
        assert "vendredi" in result
        assert "23" in result
        assert "janvier" in result
        assert "2026" in result

    def test_format_date_english(self):
        """Format date in English locale."""
        dt = datetime(2026, 1, 23, 10, 0)  # Friday
        result = TranslationService.format_date(dt, "en")
        assert "Friday" in result
        assert "23" in result
        assert "January" in result
        assert "2026" in result

    def test_format_date_dutch(self):
        """Format date in Dutch locale."""
        dt = datetime(2026, 1, 23, 10, 0)  # Friday
        result = TranslationService.format_date(dt, "nl")
        assert "vrijdag" in result
        assert "23" in result
        assert "januari" in result
        assert "2026" in result

    def test_format_date_german(self):
        """Format date in German locale."""
        dt = datetime(2026, 1, 23, 10, 0)  # Friday
        result = TranslationService.format_date(dt, "de")
        assert "Freitag" in result
        assert "23" in result
        assert "Januar" in result
        assert "2026" in result


@pytest.mark.django_db
class TestResolveLanguage:  # pylint: disable=missing-function-docstring
    """Order: saved user language, then Accept-Language, then LANGUAGE_CODE."""

    @staticmethod
    def _request(header=None):
        headers = {"HTTP_ACCEPT_LANGUAGE": header} if header else {}
        return RequestFactory().get("/", **headers)

    @pytest.mark.parametrize(
        ("saved", "expected"),
        [("nl-nl", "nl"), ("en-us", "en"), ("de-de", "de"), (None, "en")],
    )
    def test_email_only(self, saved, expected):
        factories.UserFactory(email="bob@example.com", language=saved)
        assert TranslationService.resolve_language(email="bob@example.com") == expected

    def test_email_case_does_not_matter(self):
        factories.UserFactory(email="Bob.Smith@Example.com", language="nl-nl")
        lang = TranslationService.resolve_language(email="bob.smith@example.com")
        assert lang == "nl"

    def test_unknown_email_falls_back_to_default(self):
        assert TranslationService.resolve_language(email="nobody@example.com") == "en"

    @override_settings(LANGUAGE_CODE="nl-nl")
    def test_fallback_respects_language_code(self):
        assert TranslationService.resolve_language(email="nobody@example.com") == "nl"
        assert TranslationService.resolve_language(request=self._request("es")) == "nl"

    @pytest.mark.parametrize(
        ("saved", "expected"),
        [("nl-nl", "nl"), (None, "fr")],
    )
    def test_saved_language_then_browser(self, saved, expected):
        factories.UserFactory(email="bob@example.com", language=saved)
        lang = TranslationService.resolve_language(
            request=self._request("fr"), email="bob@example.com"
        )
        assert lang == expected

    def test_unknown_email_uses_the_browser(self):
        lang = TranslationService.resolve_language(
            request=self._request("nl"), email="nobody@example.com"
        )
        assert lang == "nl"

    @pytest.mark.parametrize(
        ("header", "expected"),
        [
            (None, "en"),
            ("en;q=0.5,nl;q=0.9", "nl"),
            ("de,en;q=0.8", "de"),
            ("es,fr;q=0.8", "fr"),
            ("es", "en"),
            ("es,fr;q=0", "en"),
            ("*", "en"),
        ],
    )
    def test_browser_only(self, header, expected):
        assert (
            TranslationService.resolve_language(request=self._request(header))
            == expected
        )
