import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  BASE_LANGUAGE,
  IS_LANGUAGE_FORCED,
  LANGUAGE_COOKIE,
  LANGUAGES_ALLOWED,
  LANGUAGE_LOCAL_STORAGE,
} from "./conf";

import LanguageDetector from "i18next-browser-languagedetector";

import resources from "./translations.json";

/**
 * How language works:
 *
 * - On the first visit the language is detected from the cookie, then from the browser (LanguageDetector).
 * - The login page's language selector can override it before login.
 * - After login, Auth.tsx applies user.language (synced from the identity provider's locale claim),
 *   but only when user.language_confirmed_by_idp is true.
 * - Logging out clears the remembered language.
 *
 * This way we ensure that we use the most probable language of the user.
 */

const syncLanguageToDom = (lng: string) => {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("lang", lng);
  try {
    localStorage.setItem(LANGUAGE_LOCAL_STORAGE, lng);
  } catch (error) {
    // Storage can be unavailable (private mode, blocked site data); the
    // language still applies for this session.
    console.warn("Could not remember the language", error);
  }
};

// Fires on subsequent changes (login-page selector, user.language sync).
i18n.on("languageChanged", syncLanguageToDom);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: BASE_LANGUAGE,
    detection: {
      order: IS_LANGUAGE_FORCED ? ["cookie"] : ["cookie", "navigator"],
      caches: ["cookie"],
      lookupCookie: LANGUAGE_COOKIE,
      cookieMinutes: 525600,
      cookieOptions: {
        path: "/",
        sameSite: "lax",
      },
    },
    interpolation: {
      escapeValue: false,
    },
    showSupportNotice: false,
    preload: LANGUAGES_ALLOWED,
  })
  .then(() => syncLanguageToDom(i18n.language))
  .catch(() => {
    throw new Error("i18n initialization failed");
  });

export default i18n;
