'use client';

import { useState } from 'react';
import { useCalendarStore } from './store/calendarStore';
import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const createDateString = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const checkIsToday = (today: Date, year: number, month: number, day: number) =>
  day === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear();

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const events = useCalendarStore((state) => state.events);
  const getEventsForDate = useCalendarStore((state) => state.getEventsForDate);

  const createDayObject = (
    day: number,
    year: number,
    month: number,
    isCurrentMonth: boolean
  ) => {
    const dateString = createDateString(year, month, day);
    return {
      day,
      isCurrentMonth,
      isToday: checkIsToday(today, year, month, day),
      dateString,
      hasEvents: events.some((event) => event.date === dateString)
    };
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    // previous month days
    const prevMonthDays = Array.from({ length: firstDay }, (_, i) => {
      const day = daysInPrevMonth - firstDay + i + 1;
      return createDayObject(day, prevMonthYear, prevMonth, false);
    });

    // current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) =>
      createDayObject(i + 1, currentYear, currentMonth, true)
    );

    // next month days to fill grid (42 cells total for 6 rows × 7 days)
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays;
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) =>
      createDayObject(i + 1, nextMonthYear, nextMonth, false)
    );

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const canGoPrevious =
    currentYear > MIN_YEAR || (currentYear === MIN_YEAR && currentMonth > 0);
  const canGoNext =
    currentYear < MAX_YEAR || (currentYear === MAX_YEAR && currentMonth < 11);

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={() => {
            if (currentMonth === 0 && currentYear > MIN_YEAR) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else if (currentMonth > 0) {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          disabled={!canGoPrevious}
          className="text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer transition-colors text-2xl leading-none p-2"
        >
          ‹
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <h2 className="text-base font-semibold text-gray-100 tracking-tight">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => {
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer px-3 py-1"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => {
            if (currentMonth === 11 && currentYear < MAX_YEAR) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else if (currentMonth < 11) {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          disabled={!canGoNext}
          className="text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer transition-colors text-2xl leading-none p-2"
        >
          ›
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2 px-1">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-400 py-1.5 bg-gray-800/50 rounded-sm border border-gray-700/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1 px-1">
        {calendarDays.map((dayInfo, index) => (
          <div
            key={index}
            onClick={() => {
              const eventsForDay = getEventsForDate(dayInfo.dateString);
              const childWindowId =
                eventsForDay.length > 0
                  ? 'CALENDAR_EVENT_VIEWER'
                  : 'CALENDAR_EVENT_FORM';

              dispatchWindowEvent('desktop:open-child-window', {
                childWindowId,
                parentAppId: 'CALENDAR',
                selectedDate: dayInfo.dateString
              });
            }}
            className={`
              flex items-center justify-center text-sm rounded-sm cursor-pointer relative
              ${
                dayInfo.isCurrentMonth
                  ? 'text-gray-200 bg-gray-800/60 border border-gray-700/60 hover:bg-gray-700/60'
                  : 'text-gray-600 bg-gray-900/40 border border-gray-800/50'
              }
              ${dayInfo.isToday ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 font-semibold' : ''}
              transition-all
            `}
          >
            {dayInfo.day}
            {dayInfo.hasEvents && (
              <div className="absolute bottom-1 w-1 h-1 bg-green-400 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
