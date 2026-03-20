import { MainLayout } from "@gouvfr-lasuite/ui-kit";
import Head from "next/head";
import { useTranslation } from "next-i18next";

import { useAuth } from "@/features/auth/Auth";
import { GlobalLayout } from "@/features/layouts/components/global/GlobalLayout";
import {
  HeaderIcon,
  HeaderRight,
} from "@/features/layouts/components/header/Header";
import { Toaster } from "@/features/ui/components/toaster/Toaster";
import { ChannelList } from "@/features/integrations/components/ChannelList";

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Head>
        <title>
          {t("integrations.title")} - {t("app_title")}
        </title>
        <meta
          name="description"
          content={t("integrations.description")}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="integrations-page">
        <ChannelList />
      </div>

      <Toaster />
    </>
  );
}

IntegrationsPage.getLayout = function getLayout(
  page: React.ReactElement,
) {
  return (
    <GlobalLayout>
      <MainLayout
        enableResize={false}
        hideLeftPanelOnDesktop={true}
        icon={<HeaderIcon />}
        rightHeaderContent={<HeaderRight />}
      >
        {page}
      </MainLayout>
    </GlobalLayout>
  );
};
