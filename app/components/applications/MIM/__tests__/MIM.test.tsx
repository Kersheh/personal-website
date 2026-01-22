import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MIM from '../MIM';
import { useMIMStore } from '../store/mimStore';

global.fetch = jest.fn();

// mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// suppress expected console errors in tests
jest.spyOn(console, 'error').mockImplementation();

describe('<MIM />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // clear the zustand store before each test
    useMIMStore.setState({
      user: {
        username: null,
        id: null
      },
      preferences: {
        use24HourFormat: false,
        theme: 'slate'
      }
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render joining state initially', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        userId: 'user1',
        username: 'TestUser'
      })
    });

    render(<MIM />);

    expect(screen.getByText('Joining chat room...')).toBeInTheDocument();
  });

  it('should join chat and display username', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        userId: 'user1',
        username: 'TestUser99'
      })
    });

    render(<MIM />);

    await waitFor(() => {
      expect(screen.getByText(/TestUser99/)).toBeInTheDocument();
    });
  });

  it('should display error when join fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<MIM />);

    await waitFor(() => {
      expect(screen.getByText('Failed to join chat room')).toBeInTheDocument();
    });
  });

  it('should fetch and display messages', async () => {
    const mockMessages = [
      {
        id: 'msg1',
        userId: 'user2',
        username: 'OtherUser',
        message: 'Hello!',
        timestamp: Date.now()
      }
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          userId: 'user1',
          username: 'TestUser'
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          messages: mockMessages,
          timestamp: Date.now()
        })
      });

    render(<MIM />);

    await waitFor(
      () => {
        expect(screen.getByText('Hello!')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('OtherUser')).toBeInTheDocument();
  });

  it('should send a message when form is submitted', async () => {
    const user = userEvent.setup({ delay: null });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          userId: 'user1',
          username: 'TestUser'
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          messages: [],
          timestamp: Date.now()
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: {
            id: 'msg1',
            userId: 'user1',
            username: 'TestUser',
            message: 'Test message',
            timestamp: Date.now()
          }
        })
      });

    render(<MIM />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Type a message...')
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat/messages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user1',
            username: 'TestUser',
            message: 'Test message'
          })
        })
      );
    });
  });

  it('should disable send button when input is empty', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          userId: 'user1',
          username: 'TestUser'
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          messages: [],
          timestamp: Date.now()
        })
      });

    render(<MIM />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should poll for new messages at regular intervals', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          userId: 'user1',
          username: 'TestUser'
        })
      })
      .mockResolvedValue({
        json: async () => ({
          success: true,
          messages: [],
          timestamp: Date.now()
        })
      });

    render(<MIM />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Type a message...')
      ).toBeInTheDocument();
    });

    const initialFetchCount = (global.fetch as jest.Mock).mock.calls.filter(
      (call) => call[0] === '/api/chat/messages'
    ).length;

    jest.advanceTimersByTime(2500);

    await waitFor(() => {
      const currentFetchCount = (global.fetch as jest.Mock).mock.calls.filter(
        (call) => call[0] && call[0].startsWith('/api/chat/messages')
      ).length;
      expect(currentFetchCount).toBeGreaterThan(initialFetchCount);
    });
  });

  it('should clear input after sending message', async () => {
    const user = userEvent.setup({ delay: null });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          userId: 'user1',
          username: 'TestUser'
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          messages: [],
          timestamp: Date.now()
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          message: {
            id: 'msg1',
            userId: 'user1',
            username: 'TestUser',
            message: 'Test message',
            timestamp: Date.now()
          }
        })
      });

    render(<MIM />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Type a message...')
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(
      'Type a message...'
    ) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(
      () => {
        expect(input.value).toBe('');
        expect(document.activeElement).toBe(input);
      },
      { timeout: 3000 }
    );
  });
});
