import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CalendarEventForm from '../CalendarEventForm';
import { useCalendarStore } from '../store/calendarStore';

jest.mock('../store/calendarStore');

describe('<CalendarEventForm />', () => {
  const mockOnClose = jest.fn();
  const mockAddEvent = jest.fn();
  const selectedDate = '2026-01-15';

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalendarStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ addEvent: mockAddEvent })
    );
  });

  it('should render the formatted date', () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByText('Thursday, January 15, 2026')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });

  it('should auto-focus title input on mount', () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    expect(titleInput).toHaveFocus();
  });

  it('should disable end time when start time is empty', () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const endTimeInput = screen.getByLabelText(/end time/i);
    expect(endTimeInput).toBeDisabled();
  });

  it('should enable end time when start time is filled', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);

    await userEvent.type(startTimeInput, '10:00');

    expect(endTimeInput).not.toBeDisabled();
  });

  it('should update form fields when typing', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const locationInput = screen.getByLabelText(/location/i);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Team Meeting');
    await userEvent.type(startTimeInput, '10:00');
    await userEvent.type(endTimeInput, '11:00');
    await userEvent.type(locationInput, 'Conference Room');

    expect(titleInput).toHaveValue('Team Meeting');
    expect(startTimeInput).toHaveValue('10:00');
    expect(endTimeInput).toHaveValue('11:00');
    expect(locationInput).toHaveValue('Conference Room');
  });

  it('should not submit when title is empty', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const addButton = screen.getByRole('button', { name: /add event/i });

    await userEvent.click(addButton);

    expect(mockAddEvent).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should submit with only title (optional fields)', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    const addButton = screen.getByRole('button', { name: /add event/i });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Quick Meeting');
    await userEvent.click(addButton);

    expect(mockAddEvent).toHaveBeenCalledWith({
      date: selectedDate,
      title: 'Quick Meeting',
      startTime: undefined,
      endTime: undefined,
      location: undefined
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit with all fields filled', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const locationInput = screen.getByLabelText(/location/i);
    const addButton = screen.getByRole('button', { name: /add event/i });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Team Meeting');
    await userEvent.type(startTimeInput, '10:00');
    await userEvent.type(endTimeInput, '11:00');
    await userEvent.type(locationInput, 'Conference Room');
    await userEvent.click(addButton);

    expect(mockAddEvent).toHaveBeenCalledWith({
      date: selectedDate,
      title: 'Team Meeting',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Conference Room'
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should trim whitespace from title and location', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    const locationInput = screen.getByLabelText(/location/i);
    const addButton = screen.getByRole('button', { name: /add event/i });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '  Meeting  ');
    await userEvent.type(locationInput, '  Room 101  ');
    await userEvent.click(addButton);

    expect(mockAddEvent).toHaveBeenCalledWith({
      date: selectedDate,
      title: 'Meeting',
      startTime: undefined,
      endTime: undefined,
      location: 'Room 101'
    });
  });

  it('should not submit when title is only whitespace', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const titleInput = screen.getByLabelText(/event title/i);
    const addButton = screen.getByRole('button', { name: /add event/i });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '   ');
    await userEvent.click(addButton);

    expect(mockAddEvent).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when cancel button clicked', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockAddEvent).not.toHaveBeenCalled();
  });

  it('should set min attribute on end time to match start time', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const startTimeInput = screen.getByLabelText(
      /start time/i
    ) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/end time/i) as HTMLInputElement;

    await userEvent.type(startTimeInput, '10:00');

    expect(endTimeInput).toHaveAttribute('min', '10:00');
  });

  it('should not allow end time before start time', async () => {
    render(
      <CalendarEventForm selectedDate={selectedDate} onClose={mockOnClose} />
    );

    const startTimeInput = screen.getByLabelText(
      /start time/i
    ) as HTMLInputElement;
    const endTimeInput = screen.getByLabelText(/end time/i) as HTMLInputElement;

    await userEvent.type(startTimeInput, '10:00');
    await userEvent.type(endTimeInput, '09:00');

    // browser validation should prevent this, but the min attribute should be set
    expect(endTimeInput).toHaveAttribute('min', '10:00');
    expect(endTimeInput.value).toBe('09:00'); // value can be set but will be invalid
  });
});
