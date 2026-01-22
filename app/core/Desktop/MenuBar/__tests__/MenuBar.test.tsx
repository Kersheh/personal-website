import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MenuBar from '../MenuBar';
import * as githubModule from '@/app/utils/commands/github';
import * as linkedinModule from '@/app/utils/commands/linkedin';
import * as emailModule from '@/app/utils/commands/email';

jest.mock('@/app/utils/commands/github');
jest.mock('@/app/utils/commands/linkedin');
jest.mock('@/app/utils/commands/email');

jest.mock('@/app/components/applications/appRegistry', () => ({
  resolveAppId: jest.fn((name: string) => name),
  getAppConfig: jest.fn(() => ({
    customMenuSections: []
  })),
  isChildWindowId: jest.fn(() => false),
  AppId: {}
}));

const mockSetFocusedApp = jest.fn();
const mockGetWindowsForApp = jest.fn();
const mockGetChildWindowsForApp = jest.fn(() => []);

let mockStoreState = {
  focusedApp: null as string | null,
  focusedWindowId: null as string | null,
  setFocusedApp: mockSetFocusedApp,
  getWindowsForApp: mockGetWindowsForApp,
  getChildWindowsForApp: mockGetChildWindowsForApp
};

jest.mock('@/app/store/desktopApplicationStore', () => {
  return {
    useDesktopApplicationStore: jest.fn((fn) => {
      return fn(mockStoreState);
    })
  };
});

describe('<MenuBar />', () => {
  const mockPowerOff = jest.fn();
  const mockCloseWindow = jest.fn();
  const mockOpenWindow = jest.fn();
  const mockOpenChildWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = {
      focusedApp: null,
      focusedWindowId: null,
      setFocusedApp: mockSetFocusedApp,
      getWindowsForApp: mockGetWindowsForApp,
      getChildWindowsForApp: mockGetChildWindowsForApp
    };

    jest.spyOn(githubModule, 'default').mockReturnValue('https://github.com');
    jest
      .spyOn(linkedinModule, 'default')
      .mockReturnValue('https://linkedin.com');
    jest
      .spyOn(emailModule, 'default')
      .mockReturnValue('mailto:test@example.com');
  });

  describe('External links - GitHub and LinkedIn', () => {
    it('should render GitHub link with correct href', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const githubLink = await screen.findByText('GitHub');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink.closest('a')).toHaveAttribute(
        'href',
        'https://github.com'
      );
      expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(githubLink.closest('a')).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    });

    it('should render LinkedIn link with correct href', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const linkedinLink = await screen.findByText('LinkedIn');
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink.closest('a')).toHaveAttribute(
        'href',
        'https://linkedin.com'
      );
      expect(linkedinLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(linkedinLink.closest('a')).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    });

    it('should close dropdown when external link is clicked', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const githubLinkElement = await screen.findByText('GitHub');
      const githubLink = githubLinkElement.closest('a');
      await userEvent.click(githubLink!);

      await waitFor(() => {
        expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
      });
    });
  });

  describe('mailto: links - JavaScript reveal', () => {
    it('should not expose mailto: href in DOM', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const hrefElements = screen.queryAllByRole('link', {
        name: 'mailto:test@example.com'
      });
      expect(hrefElements).toHaveLength(0);
    });

    it('should render email button instead of link', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const emailButton = await screen.findByText('Email');
      expect(emailButton).toBeInTheDocument();
      expect(emailButton.tagName).toBe('BUTTON');
      expect(emailButton.closest('button')).not.toHaveAttribute('href');
    });

    it('should trigger mailto: on email button click', async () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const emailButton = await screen.findByText('Email');
      expect(emailButton).toBeInTheDocument();
      expect(emailButton.tagName).toBe('BUTTON');
    });

    it('should close dropdown after email button click', async () => {
      // suppress console.error for jest navigation not implemented error
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const logoButton = screen.getByRole('button', { name: /social links/i });
      await userEvent.click(logoButton);

      const emailButton = await screen.findByText('Email');
      await userEvent.click(emailButton);

      await waitFor(() => {
        expect(screen.queryByText('Email')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('File menu - Close Window', () => {
    it('should not show File menu when no window is focused', () => {
      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const fileButton = screen.queryByRole('button', { name: 'File' });
      expect(fileButton).not.toBeInTheDocument();
    });

    it('should show File menu when a window is focused', () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const fileButton = screen.getByRole('button', { name: 'File' });
      expect(fileButton).toBeInTheDocument();
    });

    it('should open File dropdown when clicking File button', async () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const fileButton = screen.getByRole('button', { name: 'File' });
      await userEvent.click(fileButton);

      const closeWindowButton = await screen.findByText('Close Window');
      expect(closeWindowButton).toBeInTheDocument();
    });

    it('should call onCloseWindow when Close Window is clicked', async () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const fileButton = screen.getByRole('button', { name: 'File' });
      await userEvent.click(fileButton);

      const closeWindowButton = await screen.findByText('Close Window');
      expect(closeWindowButton).toBeInTheDocument();
    });

    it('should close File dropdown after closing a window', async () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const fileButton = screen.getByRole('button', { name: 'File' });
      await userEvent.click(fileButton);

      const closeWindowButton = await screen.findByText('Close Window');
      expect(closeWindowButton).toBeInTheDocument();
    });
  });

  describe('App menu - Close Application', () => {
    it('should not show app menu when no app is focused', () => {
      mockStoreState = {
        focusedApp: null,
        focusedWindowId: null,
        setFocusedApp: jest.fn(),
        getWindowsForApp: jest.fn(() => []),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const terminalButton = screen.queryByRole('button', { name: 'TERMINAL' });
      expect(terminalButton).not.toBeInTheDocument();
    });

    it('should show app menu when an app is focused', () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const terminalButton = screen.getByRole('button', { name: 'TERMINAL' });
      expect(terminalButton).toBeInTheDocument();
    });

    it('should open app dropdown when clicking app name', async () => {
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: jest.fn(() => ['window-1']),
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const terminalButton = screen.getByRole('button', { name: 'TERMINAL' });
      await userEvent.click(terminalButton);

      const closeAppButton = await screen.findByText('Close Application');
      expect(closeAppButton).toBeInTheDocument();
    });

    it('should call onCloseWindow for each window when Close Application is clicked', async () => {
      const getWindowsForAppMock = jest.fn(() => [
        'window-1',
        'window-2',
        'window-3'
      ]);
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: getWindowsForAppMock,
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const terminalButton = screen.getByRole('button', { name: 'TERMINAL' });
      await userEvent.click(terminalButton);

      const closeAppButton = await screen.findByText('Close Application');
      await userEvent.click(closeAppButton);

      expect(mockCloseWindow).toHaveBeenCalledTimes(3);
      expect(mockCloseWindow).toHaveBeenCalledWith('window-1');
      expect(mockCloseWindow).toHaveBeenCalledWith('window-2');
      expect(mockCloseWindow).toHaveBeenCalledWith('window-3');
    });

    it('should close app dropdown after closing application', async () => {
      const getWindowsForAppMock = jest.fn(() => [
        'window-1',
        'window-2',
        'window-3'
      ]);
      mockStoreState = {
        focusedApp: 'TERMINAL',
        focusedWindowId: 'window-1',
        setFocusedApp: mockSetFocusedApp,
        getWindowsForApp: getWindowsForAppMock,
        getChildWindowsForApp: jest.fn(() => [])
      };

      render(
        <MenuBar
          onPowerOff={mockPowerOff}
          onCloseWindow={mockCloseWindow}
          onOpenWindow={mockOpenWindow}
          onOpenChildWindow={mockOpenChildWindow}
        />
      );

      const terminalButton = screen.getByRole('button', { name: 'TERMINAL' });
      await userEvent.click(terminalButton);

      const closeAppButton = await screen.findByText('Close Application');
      expect(closeAppButton).toBeInTheDocument();
    });
  });
});
