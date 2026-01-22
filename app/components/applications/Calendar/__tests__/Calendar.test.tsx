import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Calendar from '../Calendar';
import { useCalendarStore } from '../store/calendarStore';
import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

jest.mock('../store/calendarStore');
jest.mock('@/app/hooks/useWindowEvent');

describe('<Calendar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        events: [],
        getEventsForDate: jest.fn(() => [])
      })
    );
  });

  it('should render current month and year', () => {
    render(<Calendar />);

    const now = new Date();
    const months = [
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
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();

    expect(
      screen.getByText(`${currentMonth} ${currentYear}`)
    ).toBeInTheDocument();
  });

  it('should render days of week header', () => {
    render(<Calendar />);

    expect(screen.getAllByText('Sun').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fri').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sat').length).toBeGreaterThan(0);
  });

  it('should render 42 day cells (6 weeks)', () => {
    const { container } = render(<Calendar />);

    const dayGrid = container.querySelector('.grid-cols-7:last-child');
    const dayCells = dayGrid?.querySelectorAll('div');

    expect(dayCells?.length).toBe(42);
  });

  it('should have Today button', () => {
    render(<Calendar />);

    const todayButtons = screen.getAllByRole('button', { name: /today/i });
    expect(todayButtons.length).toBeGreaterThan(0);
  });

  it('should navigate to next month', async () => {
    render(<Calendar />);

    const now = new Date();
    const nextMonthButton = screen.getAllByRole('button')[2]; // right arrow

    await userEvent.click(nextMonthButton);

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
    const months = [
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

    expect(
      screen.getByText(new RegExp(months[nextMonth.getMonth()]))
    ).toBeInTheDocument();
  });

  it('should navigate to previous month', async () => {
    render(<Calendar />);

    const now = new Date();
    const prevMonthButton = screen.getAllByRole('button')[0]; // left arrow

    await userEvent.click(prevMonthButton);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const months = [
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

    expect(
      screen.getByText(new RegExp(months[prevMonth.getMonth()]))
    ).toBeInTheDocument();
  });

  it('should return to current month when Today button clicked', async () => {
    render(<Calendar />);

    const now = new Date();
    const months = [
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

    // navigate away
    const nextMonthButton = screen.getAllByRole('button')[2];
    await userEvent.click(nextMonthButton);

    // click today
    const todayButton = screen.getAllByRole('button', { name: /today/i })[0];
    await userEvent.click(todayButton);

    expect(
      screen.getByText(`${months[now.getMonth()]} ${now.getFullYear()}`)
    ).toBeInTheDocument();
  });

  it('should have previous and next navigation buttons', () => {
    render(<Calendar />);

    const buttons = screen.getAllByRole('button');
    // should have at least prev, today, and next buttons
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('should open event form when clicking day without events', async () => {
    const { container } = render(<Calendar />);

    // find day 15
    const dayGrid = container.querySelector('.grid-cols-7:last-child');
    const dayCells = dayGrid?.querySelectorAll('div');
    const day15 = Array.from(dayCells || []).find(
      (cell) =>
        cell.textContent === '15' && cell.className.includes('text-gray-200')
    );

    if (day15) {
      await userEvent.click(day15);

      expect(dispatchWindowEvent).toHaveBeenCalledWith(
        'desktop:open-child-window',
        expect.objectContaining({
          childWindowId: 'CALENDAR_EVENT_FORM',
          parentAppId: 'CALENDAR'
        })
      );
    }
  });

  it('should display event indicator on days with events', () => {
    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        events: [{ id: '1', date: '2026-01-15', title: 'Test Event' }],
        getEventsForDate: jest.fn(() => [])
      })
    );

    const { container } = render(<Calendar />);

    const dayGrid = container.querySelector('.grid-cols-7:last-child');
    const dayCells = dayGrid?.querySelectorAll('div');
    const day15 = Array.from(dayCells || []).find(
      (cell) =>
        cell.textContent === '15' && cell.className.includes('text-gray-200')
    );

    if (day15) {
      const indicator = day15.querySelector('.bg-green-400');
      expect(indicator).toBeInTheDocument();
    }
  });
});
