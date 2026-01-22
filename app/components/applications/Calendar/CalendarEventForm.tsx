'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendarStore } from './store/calendarStore';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface CalendarEventFormProps {
  selectedDate: string; // YYYY-MM-DD format
  onClose: () => void;
}

const CalendarEventForm = ({
  selectedDate,
  onClose
}: CalendarEventFormProps) => {
  const addEvent = useCalendarStore((state) => state.addEvent);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // focus the title input when component mounts
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-1 select-none">
          {formatDate(selectedDate)}
        </h3>
      </div>

      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();

          if (!title.trim()) {
            return;
          }

          addEvent({
            date: selectedDate,
            title: title.trim(),
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            location: location.trim() || undefined
          });

          onClose();
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <label
            htmlFor="event-title"
            className="block text-xs text-gray-400 mb-1 select-none"
          >
            Event Title *
          </label>
          <input
            id="event-title"
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="start-time"
              className="block text-xs text-gray-400 mb-1 select-none"
            >
              Start Time
            </label>
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          <div>
            <label
              htmlFor="end-time"
              className="block text-xs text-gray-400 mb-1 select-none"
            >
              End Time
            </label>
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!startTime}
              min={startTime || undefined}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="event-location"
            className="block text-xs text-gray-400 mb-1 select-none"
          >
            Location
          </label>
          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors cursor-pointer"
          >
            Add Event
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalendarEventForm;
