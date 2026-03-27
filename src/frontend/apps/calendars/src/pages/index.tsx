import { GlobalLayout } from "@/features/layouts/components/global/GlobalLayout";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/features/auth/Auth";
import { useEffect } from "react";
import {
  addToast,
  Toaster,
  ToasterItem,
} from "@/features/ui/components/toaster/Toaster";
import { SESSION_STORAGE_REDIRECT_AFTER_LOGIN_URL } from "@/features/api/fetchApi";
import { MosaLoginPage } from "@/features/home/components/MosaLoginPage";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.can_access === false) {
        window.location.href = "/no-access";
        return;
      }
      const attemptedUrl = sessionStorage.getItem(
        SESSION_STORAGE_REDIRECT_AFTER_LOGIN_URL
      );
      if (attemptedUrl) {
        sessionStorage.removeItem(SESSION_STORAGE_REDIRECT_AFTER_LOGIN_URL);
        try {
          const url = new URL(attemptedUrl, window.location.origin);
          if (url.origin === window.location.origin) {
            window.location.href = url.href;
          } else {
            window.location.href = "/calendar";
          }
        } catch {
          window.location.href = "/calendar";
        }
      } else {
        window.location.href = "/calendar";
      }
    }
  }, [user]);

  useEffect(() => {
    const failure = new URLSearchParams(window.location.search).get(
      "auth_error"
    );
    if (failure === "alpha") {
      addToast(
        <ToasterItem type="error">
          <span className="material-icons">science</span>
          <span>{t("authentication.error.alpha")}</span>
        </ToasterItem>
      );
    }
  }, []);

  if (user) {
    return null;
  }

  return (
    <>
      <MosaLoginPage />
      <Toaster />
    </>
  );
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return <GlobalLayout>{page}</GlobalLayout>;
};
