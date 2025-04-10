/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Event } from "../../../lib/types";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function Calendar({ events }: { events: Event[] }) {
  return (
    <div className="h-[600px]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "#3b82f6",
            borderRadius: "4px",
            border: "none",
          },
        })}
        components={{
          event: ({ event }) => (
            <div className="p-1">
              <strong>{event.title}</strong>
              {event.className && (
                <div className="text-xs">{event.className}</div>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
}
