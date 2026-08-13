import {
  DropdownMenu,
  Icon,
  IconType,
  LanguagePicker,
  useResponsive,
} from "@gouvfr-lasuite/ui-kit";
import { GearRounded } from "@gouvfr-lasuite/ui-kit/icons";
import { Button } from "@gouvfr-lasuite/cunningham-react";
import { useAuth } from "@/features/auth/Auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { fetchAPI } from "@/features/api/fetchApi";
import { Feedback } from "@/features/feedback/Feedback";
import { Gaufre } from "@/features/ui/components/gaufre/Gaufre";
import { AppSwitcherButton } from "@/features/ui/components/app-switcher-panel";
import { DynamicCalendarLogo } from "@/features/ui/components/logo";
import { UserProfile } from "@/features/ui/components/user/UserProfile";
import { FeatureFlag, useFeatureFlag } from "@/hooks/useFeatureFlag";

export const HeaderIcon = () => {
  const navigate = useNavigate();

  return (
    <div className="calendars__header__left">
      <div
        onClick={() => void navigate({ to: "/" })}
        style={{ cursor: "pointer" }}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") void navigate({ to: "/" });
        }}
      >
        <DynamicCalendarLogo variant="header" />
      </div>
      <Feedback />
    </div>
  );
};

const ApplicationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isResourcesEnabled = useFeatureFlag(FeatureFlag.ADMIN_RESOURCES);
  const isChannelsEnabled = useFeatureFlag(FeatureFlag.ADMIN_CHANNELS);
  const isAvailabilitiesEnabled = useFeatureFlag(FeatureFlag.ADMIN_AVAILABILITIES);

  if (!user) return null;

  const adminOptions = user.can_admin
    ? [
        ...(isResourcesEnabled
          ? [
              {
                label: t("resources.title"),
                icon: <Icon name="meeting_room" type={IconType.OUTLINED} />,
                callback: () => void navigate({ to: "/resources" }),
              },
            ]
          : []),
        ...(isChannelsEnabled
          ? [
              {
                label: t("integrations.title"),
                icon: <Icon name="integration_instructions" type={IconType.OUTLINED} />,
                callback: () => void navigate({ to: "/integrations" }),
              },
            ]
          : []),
      ]
    : [];

  const options = [
    ...(isAvailabilitiesEnabled
      ? [
          {
            label: t("settings.workingHours.title"),
            icon: <Icon name="schedule" type={IconType.OUTLINED} />,
            callback: () => void navigate({ to: "/availabilities" }),
          },
        ]
      : []),
    ...adminOptions,
  ];

  if (options.length === 0) return null;

  return (
    <DropdownMenu isOpen={isOpen} onOpenChange={setIsOpen} options={options}>
      <Button
        onClick={() => setIsOpen(true)}
        icon={<GearRounded />}
        aria-label={t("settings.label")}
        color="brand"
        variant="tertiary"
      />
    </DropdownMenu>
  );
};

export const HeaderRight = () => {
  const { isTablet } = useResponsive();

  return (
    <>
      {!isTablet && (
        <>
          <ApplicationMenu />
          <AppSwitcherButton />
          <Gaufre />
          <UserProfile />
        </>
      )}
    </>
  );
};

const PICKER_LANGUAGES = [
  { label: "Français", value: "fr-fr", shortLabel: "FR" },
  { label: "English", value: "en-us", shortLabel: "EN" },
  { label: "Nederlands", value: "nl-nl", shortLabel: "NL" },
  { label: "Deutsch", value: "de-de", shortLabel: "DE" },
];

const toPickerLanguage = (lng?: string) => {
  if (!lng) return undefined;
  const base = lng.toLowerCase().split("-")[0];
  return PICKER_LANGUAGES.find((language) => language.value.startsWith(base))?.value;
};

export const LanguagePickerUserMenu = () => {
  const { i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.language ?? toPickerLanguage(i18n.language),
  );

  // Sync the user's backend language into the picker state and into i18next on
  // load and whenever the user object updates. The backend value is the source
  // of truth — it's also used server-side for email invitations.
  useEffect(() => {
    if (user?.language) {
      setSelectedLanguage(user.language);
      if (i18n.language !== user.language) {
        i18n.changeLanguage(user.language).catch((err) => {
          console.error("Error changing language", err);
        });
      }
      return;
    }

    const syncFromI18n = (lng: string) => setSelectedLanguage(toPickerLanguage(lng));
    syncFromI18n(i18n.language);
    i18n.on("languageChanged", syncFromI18n);
    return () => i18n.off("languageChanged", syncFromI18n);
  }, [user?.language, i18n]);

  const languages = PICKER_LANGUAGES.map((language) => ({
    ...language,
    isChecked: selectedLanguage === language.value,
  }));

  const onChange = (value: string) => {
    setSelectedLanguage(value);
    i18n.changeLanguage(value).catch((err) => {
      console.error("Error changing language", err);
    });
    if (user) {
      fetchAPI(`users/${user.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ language: value }),
      }).then(() => {
        void refreshUser?.();
      });
    }
  };

  return <LanguagePicker languages={languages} size="small" onChange={onChange} compact />;
};
