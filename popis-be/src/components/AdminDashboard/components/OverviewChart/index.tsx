"use client";

import { useState } from "react";
import "./styles.scss";

type Event = {
  id: number;
  title: string;
  date: Date;
  time: string;
};

// Mock data for calendar events
const mockEvents: Event[] = [
  { id: 1, title: "Koncert w parku", date: new Date(2025, 9, 5), time: "18:00" },
  { id: 2, title: "Wystawa fotografii", date: new Date(2025, 9, 8), time: "10:00" },
  { id: 3, title: "Festiwal filmowy", date: new Date(2025, 9, 12), time: "15:00" },
  { id: 4, title: "Spektakl teatralny", date: new Date(2025, 9, 15), time: "19:00" },
  { id: 5, title: "Jarmark świąteczny", date: new Date(2025, 9, 20), time: "12:00" },
  { id: 6, title: "Workshop fotograficzny", date: new Date(2025, 9, 22), time: "14:00" },
  { id: 7, title: "Koncert jazzowy", date: new Date(2025, 9, 25), time: "20:00" },
];

const daysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const firstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const OverviewChart = () => {
  const [currentDate] = useState(new Date(2025, 9, 1)); // October 2025

  const days = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });

  const getEventsForDay = (day: number) => {
    return mockEvents.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const renderCalendar = () => {
    const cells = [];
    const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];

    // Day headers
    dayNames.forEach((dayName) => {
      cells.push(
        <div key={`header-${dayName}`} className="calendar__day-header">
          {dayName}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar__day calendar__day--empty" />);
    }

    // Days of month
    for (let day = 1; day <= days; day++) {
      const events = getEventsForDay(day);
      const hasEvents = events.length > 0;

      cells.push(
        <div
          key={day}
          className={`calendar__day ${hasEvents ? "calendar__day--has-events" : ""}`}
        >
          <div className="calendar__day-number">{day}</div>
          {hasEvents && (
            <div className="calendar__events">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="calendar__event"
                  title={`${event.title} - ${event.time}`}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="calendar-widget">
      <div className="calendar-widget__header">
        <h3 className="calendar-widget__title">Kalendarz wydarzeń - {monthName}</h3>
      </div>
      <div className="calendar-widget__content">
        <div className="calendar__grid">{renderCalendar()}</div>
      </div>
    </div>
  );
};
