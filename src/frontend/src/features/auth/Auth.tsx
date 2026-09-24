import React, { PropsWithChildren, useCallback, useEffect, useState } from "react";

import i18n from "@/features/i18n/initI18n";
import { IS_LANGUAGE_FORCED, LANGUAGE_LOCAL_STORAGE } from "@/features/i18n/conf";
import { fetchAPI } from "@/features/api/fetchApi";
import { User } from "@/features/auth/types";
import { baseApiUrl } from "../api/utils";
import { APIError } from "../api/APIError";
import { SpinnerPage } from "@/features/ui/components/spinner/SpinnerPage";

// The remembered interface language *is* dropped on logout: it is a single
// key/cookie shared by every visitor of this browser, and the identity-provider
// sync below writes the signed-in user's language into it. Keeping it would
// boot the next visitor of a shared machine into the previous user's language.
const forgetRememberedLanguage = () => {
  try {
    localStorage.removeItem(LANGUAGE_LOCAL_STORAGE);
    document.cookie = "calendars_language=; path=/; max-age=0";
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); never let
    // that stop the sign-out itself.
  }
};

export const logout = () => {
  forgetRememberedLanguage();
  window.location.replace(new URL("logout/", baseApiUrl()).href);
};

export const login = (returnTo?: string) => {
  const url = new URL("authenticate/", baseApiUrl());
  if (returnTo) {
    url.searchParams.set("returnTo", returnTo);
  }
  window.location.replace(url.href);
};

interface AuthContextInterface {
  user?: User | null;
  init?: () => Promise<User | null>;
  refreshUser?: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextInterface>({});

export const useAuth = () => React.useContext(AuthContext);

export const Auth = ({ children, redirect }: PropsWithChildren & { redirect?: boolean }) => {
  const [user, setUser] = useState<User | null>();

  const init = useCallback(async () => {
    try {
      // skipAuthRedirect: this boot probe runs on public pages too, where a
      // 401 is the expected anonymous case — we don't want fetchAPI's
      // default redirect there. The explicit branches below pick the right
      // behavior based on `redirect`.
      const response = await fetchAPI(`users/me/`, { skipAuthRedirect: true });
      const data = (await response.json()) as User;
      setUser(data);
      return data;
    } catch (error) {
      if (redirect && error instanceof APIError && error.code === 401) {
        login(typeof window !== "undefined" ? window.location.href : undefined);
      } else {
        setUser(null);
      }
      return null;
    }
  }, [redirect]);

  const refreshUser = async () => {
    void init();
  };

  const shouldRedirectNoAccess = redirect && user?.can_access === false;

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (shouldRedirectNoAccess) {
      window.location.href = "/no-access";
    }
  }, [shouldRedirectNoAccess]);

  // Sync the logged-in user's saved language into i18next as soon as the user
  // loads. The backend value comes from the identity provider's OIDC "locale"
  // claim, so it outranks whatever was picked on the pre-login page or
  // detected from the browser — but only when the identity provider actually
  // asserted it: `language` is nullable but, once set, can't say whether it
  // came from the IdP or an earlier manual state, and there is no in-app
  // language picker to fall back on if we got this wrong (language can only
  // be changed pre-login, on the login page).
  useEffect(() => {
    if (IS_LANGUAGE_FORCED) return;
    if (!user?.language_confirmed_by_idp || !user.language) return;
    if (i18n.language !== user.language) {
      void i18n.changeLanguage(user.language);
    }
  }, [user?.language, user?.language_confirmed_by_idp]);

  if (user === undefined || shouldRedirectNoAccess) {
    return <SpinnerPage />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        init,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
