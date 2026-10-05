"""Unit tests for OIDC "picture" claim handling via OIDCAuthenticationBackend."""

from django.test.utils import override_settings

import pytest

from core.authentication.backends import OIDCAuthenticationBackend

pytestmark = pytest.mark.django_db


def test_authentication_sets_picture_from_claim(monkeypatch):
    """
    Real path: a "picture" claim in the userinfo response ends up in
    User.claims (via the default OIDC_STORE_CLAIMS=["picture", "locale"])
    and is exposed through the User.picture property, not just constructed
    directly on a factory instance.
    """
    klass = OIDCAuthenticationBackend()

    def get_userinfo_mocked(*args):
        return {
            "sub": "789",
            "email": "picture-claim@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "picture": "https://example.com/avatar.png",
        }

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    user = klass.get_or_create_user(
        access_token="test-token", id_token=None, payload=None
    )

    assert user.claims == {"picture": "https://example.com/avatar.png", "locale": None}
    assert user.picture == "https://example.com/avatar.png"


@override_settings(OIDC_STORE_CLAIMS=[])
def test_authentication_picture_not_stored_without_store_claims_setting(monkeypatch):
    """A "picture" claim is never stored unless OIDC_STORE_CLAIMS lists it."""
    klass = OIDCAuthenticationBackend()

    def get_userinfo_mocked(*args):
        return {
            "sub": "789",
            "email": "no-picture-claim@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "picture": "https://example.com/avatar.png",
        }

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    user = klass.get_or_create_user(
        access_token="test-token", id_token=None, payload=None
    )

    assert user.claims == {}
    assert user.picture is None
