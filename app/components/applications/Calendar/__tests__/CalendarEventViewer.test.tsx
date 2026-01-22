import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CalendarEventViewer from '../CalendarEventViewer';
import { useCalendarStore, CalendarEvent } from '../store/calendarStore';
import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

jest.mock('../store/calendarStore');
jest.mock('@/app/hooks/useWindowEvent');

describe('<CalendarEventViewer />', () => {
  const mockOnClose = jest.fn();
  const mockRemoveEvent = jest.fn();
  const selectedDate = '2026-01-15';

  const mockEvents: Array<CalendarEvent> = [
    {
      id: 'event-1',
      date: '2026-01-15',
      title: 'Team Meeting',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Conference Room'
    },
    {
      id: 'event-2',
      date: '2026-01-15',
      title: 'Lunch Break',
      startTime: '12:00',
      endTime: '13:00'
    },
    {
      id: 'event-3',
      date: '2026-01-16',
      title: 'Other Day Event'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        events: mockEvents,
        removeEvent: mockRemoveEvent
      })
    );
  });

  it('should render the formatted date', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('Thursday, January 15, 2026')).toBeInTheDocument();
  });

  it('should display event count', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('should display singular event text when only one event', () => {
    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        events: [mockEvents[0]],
        removeEvent: mockRemoveEvent
      })
    );

    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('1 event')).toBeInTheDocument();
  });

  it('should only display events for selected date', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    expect(screen.queryByText('Other Day Event')).not.toBeInTheDocument();
  });

  it('should display event with time and location', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM - 11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('📍 Conference Room')).toBeInTheDocument();
  });

  it('should display event without location', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM - 1:00 PM')).toBeInTheDocument();
  });

  it('should have delete button for each event', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('should call removeEvent when delete button clicked', async () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockRemoveEvent).toHaveBeenCalledWith('event-1');
  });

  it('should close window when last event is deleted', async () => {
    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        events: [mockEvents[0]],
        removeEvent: mockRemoveEvent
      })
    );

    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close window when deleting non-last event', async () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when close button clicked', async () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should have Add Event button', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(
      screen.getByRole('button', { name: /add event/i })
    ).toBeInTheDocument();
  });

  it('should open event form when Add Event button clicked', async () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const addEventButton = screen.getByRole('button', { name: /add event/i });
    await userEvent.click(addEventButton);

    expect(dispatchWindowEvent).toHaveBeenCalledWith(
      'desktop:open-child-window',
      {
        childWindowId: 'CALENDAR_EVENT_FORM',
        parentAppId: 'CALENDAR',
        selectedDate
      }
    );
  });

  it('should format 12-hour time correctly for AM times', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('10:00 AM - 11:00 AM')).toBeInTheDocument();
  });

  it('should format 12-hour time correctly for PM times', () => {
    render(
      <CalendarEventViewer selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('12:00 PM - 1:00 PM')).toBeInTheDocument();
  });
});
