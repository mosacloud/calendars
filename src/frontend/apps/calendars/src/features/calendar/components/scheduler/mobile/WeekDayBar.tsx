import { useMemo } from "react";
import type { WeekDayBarProps } from "../types";
import { isSameDay, isWeekend, addDays } from "@/utils/date";

export const WeekDayBar = ({
  currentDate,
  currentView,
  intlLocale,
  weekDays,
  onDayClick,
}: WeekDayBarProps) => {
  const today = useMemo(() => new Date(), []);

  const narrowDayFormatter = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" }),
    [intlLocale],
  );

  const isTwoDays = currentView === "timeGridTwoDays";

  const isSelected = (date: Date): boolean => {
    if (isTwoDays) {
      const nextDay = addDays(currentDate, 1);
      return isSameDay(date, currentDate) || isSameDay(date, nextDay);
    }
    if (currentView === "timeGridDay") {
      return isSameDay(date, currentDate);
    }
    if (currentView === "listWeek") {
      return isSameDay(date, today);
    }
    return false;
  };

  const handleClick = (date: Date) => {
    if (currentView !== "listWeek") {
      onDayClick(date);
    }
  };

  return (
    <div className="week-day-bar">
      <div className="week-day-bar__names">
        {weekDays.map((date) => (
          <span
            key={date.toISOString()}
            className={`week-day-bar__day-name${isWeekend(date) ? " week-day-bar__day-name--weekend" : ""}`}
          >
            {narrowDayFormatter.format(date)}
          </span>
        ))}
      </div>
      <div className="week-day-bar__numbers">
        {weekDays.map((date) => {
          const classes = [
            "week-day-bar__number",
            isSelected(date) && "week-day-bar__number--selected",
            isWeekend(date) && "week-day-bar__number--weekend",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={date.toISOString()}
              className={classes}
              onClick={() => handleClick(date)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
