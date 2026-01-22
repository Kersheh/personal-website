import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/app/utils/id';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  location?: string;
}

interface CalendarStore {
  events: Array<CalendarEvent>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  getEventsForDate: (date: string) => Array<CalendarEvent>;
  clearAllEvents: () => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) => {
        const newEvent: CalendarEvent = {
          ...event,
          id: generateId()
        };
        set((state) => ({ events: [...state.events, newEvent] }));
      },
      removeEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        }));
      },
      getEventsForDate: (date) => {
        return get().events.filter((event) => event.date === date);
      },
      clearAllEvents: () => {
        set({ events: [] });
      }
    }),
    {
      name: 'calendar-storage'
    }
  )
);
