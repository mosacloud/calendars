import React, { PropsWithChildren, useCallback, useEffect, useState } from "react";

import i18n from "@/features/i18n/initI18n";
import { IS_LANGUAGE_FORCED, LANGUAGE_COOKIE, LANGUAGE_LOCAL_STORAGE } from "@/features/i18n/conf";
import { fetchAPI } from "@/features/api/fetchApi";
import { User } from "@/features/auth/types";
import { baseApiUrl } from "../api/utils";
import { APIError } from "../api/APIError";
import { SpinnerPage } from "@/features/ui/components/spinner/SpinnerPage";

// Clear the remembered language on logout: the key and cookie are shared by
// everyone using this browser, and the IdP sync writes the signed-in user's
// language into them. Each is cleared on its own, so one failing (private
// mode, blocked storage) can't leave the other behind; neither may block the
// sign-out itself.
const forgetRememberedLanguage = () => {
  try {
    document.cookie = `${LANGUAGE_COOKIE}=; path=/; max-age=0`;
  } catch (error) {
    console.warn("Could not clear the remembered language cookie", error);
  }
  try {
    localStorage.removeItem(LANGUAGE_LOCAL_STORAGE);
  } catch (error) {
    console.warn("Could not clear the remembered language from storage", error);
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

  // Stable identity so consumers can list it in effect dependencies.
  const refreshUser = useCallback(async () => {
    void init();
  }, [init]);

  const shouldRedirectNoAccess = redirect && user?.can_access === false;

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (shouldRedirectNoAccess) {
      window.location.href = "/no-access";
    }
  }, [shouldRedirectNoAccess]);

  // Apply user.language only when the IdP confirmed it
  // (language_confirmed_by_idp); otherwise keep the pre-login or
  // browser-detected language. Skipped when the language is forced.
  useEffect(() => {
    if (IS_LANGUAGE_FORCED) return;
    if (!user?.language_confirmed_by_idp || !user.language) return;
    if (i18n.language !== user.language) {
      i18n.changeLanguage(user.language).catch((error) => {
        console.error("Error changing language", error);
      });
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
