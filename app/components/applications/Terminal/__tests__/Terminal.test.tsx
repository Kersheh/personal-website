import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Terminal from '../Terminal';
import commands from '@/app/utils/commands';

jest.mock('@/app/utils/commands', () => ({
  submit: jest.fn()
}));

describe('<Terminal />', () => {
  const mockCloseWindow = jest.fn();
  const windowId = 'test-window';

  beforeEach(() => {
    jest.clearAllMocks();
    (commands.submit as jest.Mock).mockResolvedValue('output');
  });

  describe('Enter key - command submit and arguments', () => {
    it('should submit command without arguments', async () => {
      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'help');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(commands.submit).toHaveBeenCalledWith(
          'help',
          expect.objectContaining({
            closeWindow: mockCloseWindow,
            windowId: windowId
          })
        );
      });
    });

    it('should submit command with arguments', async () => {
      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'help -s');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(commands.submit).toHaveBeenCalledWith(
          'help -s',
          expect.any(Object)
        );
      });
    });

    it('should clear input after successful command submission', async () => {
      (commands.submit as jest.Mock).mockResolvedValue('test output');

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(textarea, 'help');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should not submit empty input', async () => {
      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(commands.submit).not.toHaveBeenCalled();
      });
    });

    it('should not submit whitespace-only input', async () => {
      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(textarea, '   ');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(commands.submit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Arrow key navigation - history', () => {
    it('should navigate to previous command with ArrowUp', async () => {
      (commands.submit as jest.Mock).mockResolvedValue('');

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'help');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      await userEvent.type(textarea, 'github');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      await userEvent.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(textarea.value).toBe('github');
      });

      await userEvent.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(textarea.value).toBe('help');
      });
    });

    it('should navigate to next command with ArrowDown', async () => {
      (commands.submit as jest.Mock).mockResolvedValue('');

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'help');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      await userEvent.type(textarea, 'github');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      await userEvent.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(textarea.value).toBe('github');
      });

      await userEvent.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should preserve buffer when navigating history', async () => {
      (commands.submit as jest.Mock).mockResolvedValue('');

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(textarea, 'help');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      await userEvent.type(textarea, 'github -u');

      await userEvent.keyboard('{ArrowUp}');

      await waitFor(() => {
        expect(textarea.value).toBe('help');
      });

      await userEvent.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(textarea.value).toBe('github -u');
      });
    });
  });

  describe('mailto: links - JavaScript reveal', () => {
    it('should not expose mailto: href in DOM', async () => {
      (commands.submit as jest.Mock).mockResolvedValue(
        'mailto:test@example.com'
      );

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(textarea, 'email');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        const hrefElements = screen.queryAllByRole('link', {
          name: 'mailto:test@example.com'
        });
        expect(hrefElements).toHaveLength(0);
      });
    });

    it('should render mailto: email as clickable button without href', async () => {
      (commands.submit as jest.Mock).mockResolvedValue(
        'mailto:test@example.com'
      );

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(textarea, 'email');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        const emailButton = buttons.find(
          (btn) => btn.textContent === 'test@example.com'
        );
        expect(emailButton).toBeInTheDocument();
        expect(emailButton).toHaveClass('cursor-pointer');
      });
    });

    it('should trigger mailto: on button click', async () => {
      (commands.submit as jest.Mock).mockResolvedValue(
        'mailto:test@example.com'
      );

      render(
        <Terminal
          autoFocus={true}
          closeWindow={mockCloseWindow}
          windowId={windowId}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(textarea, 'email');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        const buttons = screen.queryAllByRole('button');
        const emailButton = buttons.find(
          (btn) => btn.textContent === 'test@example.com'
        );
        expect(emailButton).toBeInTheDocument();
        expect(emailButton).toHaveClass('cursor-pointer');
      });
    });
  });
});
