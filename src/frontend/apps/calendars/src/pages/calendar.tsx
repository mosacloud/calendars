/**
 * Calendar page - Main calendar view with sidebar.
 */

import { MainLayout } from "@gouvfr-lasuite/ui-kit";
import Head from "next/head";
import { useTranslation } from "next-i18next";

import { useAuth } from "@/features/auth/Auth";
import { LeftPanel } from "@/features/calendar/components";
import { GlobalLayout } from "@/features/layouts/components/global/GlobalLayout";
import {
  HeaderIcon,
  HeaderRight,
} from "@/features/layouts/components/header/Header";
import { useLeftPanel } from "@/features/layouts/contexts/LeftPanelContext";
import { Toaster } from "@/features/ui/components/toaster/Toaster";
import { Scheduler } from "@/features/calendar/components/scheduler/Scheduler";
import { CalendarContextProvider } from "@/features/calendar/contexts";

export default function CalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Head>
        <title>{t("app_title")}</title>
        <meta name="description" content={t("app_description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="calendar-page">
        <div className="calendar-page__main">
          <Scheduler />
        </div>
      </div>

      <Toaster />
    </>
  );
}

const CalendarLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLeftPanelOpen, setIsLeftPanelOpen } = useLeftPanel();

  return (
    <CalendarContextProvider>
      <div className="calendars__calendar">
        <GlobalLayout>
          <MainLayout
            enableResize={false}
            leftPanelContent={<LeftPanel />}
            icon={<HeaderIcon />}
            rightHeaderContent={<HeaderRight />}
            isLeftPanelOpen={isLeftPanelOpen}
            setIsLeftPanelOpen={setIsLeftPanelOpen}
          >
            {children}
          </MainLayout>
        </GlobalLayout>
      </div>
    </CalendarContextProvider>
  );
};

CalendarPage.getLayout = function getLayout(page: React.ReactElement) {
  return <CalendarLayout>{page}</CalendarLayout>;
};
