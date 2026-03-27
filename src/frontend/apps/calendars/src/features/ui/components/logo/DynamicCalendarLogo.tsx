"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/pages/_app";

interface DynamicCalendarLogoProps {
  variant?: "header" | "icon";
  className?: string;
}

const ASSETS: Record<string, { icon: string; header: string }> = {
  default: {
    icon: "/assets/cal_icon_no_number.svg",
    header: "/assets/cal_logotype_text_no_number.svg",
  },
  mosa: {
    icon: "/assets/cal_icon_no_number_mosa.svg",
    header: "/assets/cal_logotype_text_no_number_mosa.svg",
  },
};

export const DynamicCalendarLogo = ({
  variant = "header",
  className,
}: DynamicCalendarLogoProps) => {
  const { t } = useTranslation();
  const { theme } = useAppContext();
  const [day, setDay] = useState<number | null>(null);

  useEffect(() => {
    setDay(new Date().getDate());
  }, []);

  const isIcon = variant === "icon";
  const isDoubleDigit = day !== null && day >= 10;
  const assets = ASSETS[theme] ?? ASSETS.default;

  return (
    <div
      className={`calendars__dynamic-logo ${isIcon ? "calendars__dynamic-logo--icon" : "calendars__dynamic-logo--header"} ${theme === "mosa" ? "calendars__dynamic-logo--mosa" : ""} ${className ?? ""}`}
    >
      <img
        src={isIcon ? assets.icon : assets.header}
        alt={t("app_title")}
        className="calendars__dynamic-logo__img"
      />
      {day !== null && (
        <span
          className={`calendars__dynamic-logo__day ${isDoubleDigit ? "calendars__dynamic-logo__day--small" : ""}`}
        >
          {day}
        </span>
      )}
    </div>
  );
};
