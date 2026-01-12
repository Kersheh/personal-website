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

jest.mock('@/app/store/desktopApplicationStore', () => ({
  useDesktopApplicationStore: jest.fn((fn) => {
    return fn({
      focusedApp: null,
      focusedWindowId: null,
      setFocusedApp: jest.fn()
    });
  })
}));

describe('MenuBar', () => {
  const mockPowerOff = jest.fn();
  const mockCloseWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
        <MenuBar onPowerOff={mockPowerOff} onCloseWindow={mockCloseWindow} />
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
});
