"""
Unit tests for the User model
"""

from unittest import mock

from django.core.exceptions import ValidationError

import pytest

from core import factories

pytestmark = pytest.mark.django_db


def test_models_users_str():
    """The str representation should be the email."""
    user = factories.UserFactory()
    assert str(user) == user.email


def test_models_users_id_unique():
    """The "id" field should be unique."""
    user = factories.UserFactory()
    with pytest.raises(ValidationError, match="User with this Id already exists."):
        factories.UserFactory(id=user.id)


def test_models_users_send_mail_main_existing():
    """The "email_user' method should send mail to the user's email address."""
    user = factories.UserFactory()

    with mock.patch("django.core.mail.send_mail") as mock_send:
        user.email_user("my subject", "my message")

    mock_send.assert_called_once_with("my subject", "my message", None, [user.email])


def test_models_users_send_mail_main_missing():
    """The "email_user' method should fail if the user has no email address."""
    user = factories.UserFactory(email=None)

    with pytest.raises(ValueError) as excinfo:
        user.email_user("my subject", "my message")

    assert str(excinfo.value) == "User has no email address."


def test_models_users_language_confirmed_by_idp_true():
    """True when the stored "locale" claim maps to the user's current language."""
    user = factories.UserFactory(claims={"locale": "nl"}, language="nl-nl")
    assert user.language_confirmed_by_idp is True


def test_models_users_language_confirmed_by_idp_false_when_language_diverges():
    """False when ``language`` was changed away from the IdP's locale (e.g. via the API)."""
    user = factories.UserFactory(claims={"locale": "nl"}, language="fr-fr")
    assert user.language_confirmed_by_idp is False


@pytest.mark.parametrize("claims", [[], "nl", {"locale": "es"}, {"locale": 5}])
def test_models_users_claims_malformed_or_unsupported(claims):
    """Non-dict or unusable claims never raise and confirm nothing."""
    user = factories.UserFactory(claims=claims, language="nl-nl")
    assert user.language_confirmed_by_idp is False
    assert user.picture is None


def test_models_users_language_confirmed_by_idp_false():
    """False when the stored claims have no usable "locale" (or none at all).

    ``language`` being set is not enough on its own — it could come from a
    pre-login pick rather than the identity provider.
    """
    user = factories.UserFactory(claims={}, language="nl-nl")
    assert user.language_confirmed_by_idp is False


@pytest.mark.parametrize(
    "picture,expected",
    [
        ("https://example.com/a.png", "https://example.com/a.png"),
        ("http://example.com/a.png", "http://example.com/a.png"),
        ("data:image/png;base64,AAAA", None),
        ("javascript:alert(1)", None),
        ("", None),
        ("https:foo", None),
        ("http://[", None),
        ("https://example.com/" + "a" * 2048, None),
    ],
)
def test_models_users_picture_only_http_urls_of_bounded_length(picture, expected):
    """Only http(s) URLs of a sane length are exposed as the profile picture."""
    user = factories.UserFactory(claims={"picture": picture})
    assert user.picture == expected
