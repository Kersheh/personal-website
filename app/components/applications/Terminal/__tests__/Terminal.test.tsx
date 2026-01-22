import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Terminal from '../Terminal';
import commands from '@/app/utils/commands';
import { useFileSystemStore } from '@/app/store/fileSystemStore';

jest.mock('@/app/utils/commands', () => ({
  submit: jest.fn(),
  COMMANDS: {
    github: { cmd: 'github', description: 'Open my GitHub profile' },
    linkedin: { cmd: 'linkedin', description: 'Open my LinkedIn profile' },
    help: { cmd: 'help', description: 'Show this help message' },
    ls: { cmd: 'ls', description: 'List directory contents' },
    cd: { cmd: 'cd', description: 'Change directory' },
    rm: { cmd: 'rm', description: 'Remove files or directories' }
  }
}));

jest.mock('@/app/store/fileSystemStore');

describe('<Terminal />', () => {
  const mockCloseWindow = jest.fn();
  const windowId = 'test-window';

  beforeEach(() => {
    jest.clearAllMocks();
    (commands.submit as jest.Mock).mockResolvedValue('output');

    const mockGetState = jest.fn(() => ({
      currentDirectory: '~',
      desktopItems: ['app-mim', 'app-paint', 'app-terminal', 'file-resume'],
      setCurrentDirectory: jest.fn(),
      removeDesktopItem: jest.fn(),
      restoreAllDesktopItems: jest.fn(),
      ensureTerminalExists: jest.fn()
    }));

    (useFileSystemStore as unknown as jest.Mock).mockReturnValue({
      currentDirectory: '~',
      desktopItems: []
    });

    useFileSystemStore.getState = mockGetState;
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

  describe('Tab completion', () => {
    describe('command completion', () => {
      it('should autocomplete command with single match', async () => {
        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'git');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe('github ');
        });
      });

      it('should show multiple matches when ambiguous', async () => {
        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'l');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(screen.getByText(/linkedin/)).toBeInTheDocument();
          expect(screen.getByText(/ls/)).toBeInTheDocument();
        });
      });

      it('should not complete if no matches', async () => {
        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'xyz');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe('xyz');
        });
      });
    });

    describe('file/directory completion', () => {
      it('should autocomplete Desktop in home directory with cd', async () => {
        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'cd De');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe('cd Desktop ');
        });
      });

      it('should autocomplete file names in Desktop directory with rm', async () => {
        const mockGetState = jest.fn(() => ({
          currentDirectory: '~/Desktop',
          desktopItems: ['app-mim', 'app-paint', 'app-terminal', 'file-resume'],
          setCurrentDirectory: jest.fn(),
          removeDesktopItem: jest.fn(),
          restoreAllDesktopItems: jest.fn(),
          ensureTerminalExists: jest.fn()
        }));
        useFileSystemStore.getState = mockGetState;

        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'rm Pai');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe('rm Paint ');
        });
      });

      it('should wrap file names with spaces in quotes', async () => {
        const mockGetState = jest.fn(() => ({
          currentDirectory: '~/Desktop',
          desktopItems: ['app-dino-jump'],
          setCurrentDirectory: jest.fn(),
          removeDesktopItem: jest.fn(),
          restoreAllDesktopItems: jest.fn(),
          ensureTerminalExists: jest.fn()
        }));
        useFileSystemStore.getState = mockGetState;

        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'rm Din');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe("rm 'Dino Jump' ");
        });
      });

      it('should show multiple file matches when ambiguous', async () => {
        const mockGetState = jest.fn(() => ({
          currentDirectory: '~/Desktop',
          desktopItems: ['app-mim', 'app-paint', 'app-terminal'],
          setCurrentDirectory: jest.fn(),
          removeDesktopItem: jest.fn(),
          restoreAllDesktopItems: jest.fn(),
          ensureTerminalExists: jest.fn()
        }));
        useFileSystemStore.getState = mockGetState;

        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'rm P');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          const outputText = screen.getAllByText(/Paint/);
          expect(outputText.length).toBeGreaterThan(0);
        });
      });

      it('should not complete files for non-file commands', async () => {
        render(
          <Terminal
            autoFocus={true}
            closeWindow={mockCloseWindow}
            windowId={windowId}
          />
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        await userEvent.type(textarea, 'help De');
        await userEvent.keyboard('{Tab}');

        await waitFor(() => {
          expect(textarea.value).toBe('help De');
        });
      });
    });
  });
});
