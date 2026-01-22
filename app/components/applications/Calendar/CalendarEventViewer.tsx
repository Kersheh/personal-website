'use client';

import { useCalendarStore, CalendarEvent } from './store/calendarStore';
import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

interface CalendarEventViewerProps {
  selectedDate: string; // YYYY-MM-DD format
  onClose: () => void;
}

const CalendarEventViewer = ({
  selectedDate,
  onClose
}: CalendarEventViewerProps) => {
  const allEvents = useCalendarStore((state) => state.events);
  const removeEvent = useCalendarStore((state) => state.removeEvent);

  const events = allEvents.filter((event) => event.date === selectedDate);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-300">
          {formatDate(selectedDate)}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {events.map((event: CalendarEvent) => (
          <div
            key={event.id}
            className="bg-gray-800/60 border border-gray-700/60 rounded p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-200 truncate">
                  {event.title}
                </h4>

                {event.startTime && (
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </p>
                )}

                {event.location && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    📍 {event.location}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  removeEvent(event.id);
                  // close window if no more events
                  const remainingEvents = events.filter(
                    (e) => e.id !== event.id
                  );

                  if (remainingEvents.length === 0) {
                    onClose();
                  }
                }}
                className="text-red-400 hover:text-red-300 text-xs px-2 py-1 cursor-pointer transition-colors"
                title="Delete event"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
        <button
          onClick={() => {
            dispatchWindowEvent('desktop:open-child-window', {
              childWindowId: 'CALENDAR_EVENT_FORM',
              parentAppId: 'CALENDAR',
              selectedDate
            });
          }}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors cursor-pointer"
        >
          Add Event
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CalendarEventViewer;
