"""Tests for TranslationService."""

from datetime import datetime

from core.services.translation_service import TranslationService


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

    def test_normalize_unknown_falls_back_to_fr(self):
        assert TranslationService.normalize_lang("es") == "fr"

    def test_normalize_empty(self):
        assert TranslationService.normalize_lang("") == "fr"


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
