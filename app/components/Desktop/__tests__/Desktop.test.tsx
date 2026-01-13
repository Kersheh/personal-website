import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Desktop from '@/app/components/Desktop/Desktop';

jest.mock('@/app/store/desktopApplicationStore', () => {
  const store = {
    focusedApp: null,
    focusedWindowId: null,
    iconPositions: {},
    setFocusedApp: jest.fn(),
    registerWindow: jest.fn(),
    unregisterWindow: jest.fn(),
    getWindowsForApp: jest.fn(() => []),
    updateIconPosition: jest.fn(),
    getIconPosition: jest.fn(() => undefined)
  };

  const useDesktopApplicationStore = (
    selector: (state: typeof store) => unknown
  ) => selector(store);

  useDesktopApplicationStore.getState = () => store;

  return { useDesktopApplicationStore };
});

const getWindows = () => document.querySelectorAll('.react-draggable');
const isWindowFocused = (window: Element) =>
  window.classList.contains('opacity-100');
const isWindowUnfocused = (window: Element) =>
  window.classList.contains('opacity-60');

describe('<Desktop />', () => {
  const mockPowerOff = jest.fn();

  beforeEach(() => {
    mockPowerOff.mockClear();
  });

  it('should open a window when double-clicking Terminal icon', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');
    await user.dblClick(terminalIcon);

    await waitFor(
      () => {
        expect(getWindows().length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 2000 }
    );
  });

  it('should switch focus between two windows', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');

    await user.dblClick(terminalIcon);
    await waitFor(() => {
      expect(getWindows().length).toBe(1);
    });

    await user.dblClick(terminalIcon);
    await waitFor(() => {
      expect(getWindows().length).toBe(2);
    });

    const windows = getWindows();

    expect(isWindowUnfocused(windows[0])).toBe(true);
    expect(isWindowFocused(windows[1])).toBe(true);

    const firstWindowBar = windows[0].querySelector(
      '.window-bar'
    ) as HTMLElement;
    await user.click(firstWindowBar);

    await waitFor(() => {
      expect(isWindowFocused(windows[0])).toBe(true);
      expect(isWindowUnfocused(windows[1])).toBe(true);
    });
  });

  it('should unfocus first window when clicking desktop', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');
    await user.dblClick(terminalIcon);

    await waitFor(() => {
      expect(getWindows().length).toBe(1);
    });

    const windows = getWindows();

    expect(isWindowFocused(windows[0])).toBe(true);

    const desktopArea = document.querySelector('.p-5') as HTMLElement;
    await user.click(desktopArea);

    await waitFor(() => {
      expect(isWindowUnfocused(windows[0])).toBe(true);
    });
  });

  it('should unfocus second window when clicking desktop', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');

    await user.dblClick(terminalIcon);
    await waitFor(() => {
      expect(getWindows().length).toBe(1);
    });

    await user.dblClick(terminalIcon);
    await waitFor(() => {
      expect(getWindows().length).toBe(2);
    });

    const windows = getWindows();

    expect(isWindowFocused(windows[1])).toBe(true);

    const desktopArea = document.querySelector('.p-5') as HTMLElement;
    await user.click(desktopArea);

    await waitFor(() => {
      expect(isWindowUnfocused(windows[1])).toBe(true);
      expect(isWindowUnfocused(windows[0])).toBe(true);
    });
  });

  it('should maintain focus state when switching between multiple windows', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');

    await user.dblClick(terminalIcon);
    await user.dblClick(terminalIcon);
    await user.dblClick(terminalIcon);

    await waitFor(() => {
      expect(getWindows().length).toBe(3);
    });

    const windows = getWindows();

    expect(isWindowFocused(windows[2])).toBe(true);

    const firstWindowBar = windows[0].querySelector(
      '.window-bar'
    ) as HTMLElement;
    await user.click(firstWindowBar);

    await waitFor(() => {
      expect(isWindowFocused(windows[0])).toBe(true);
      expect(isWindowUnfocused(windows[1])).toBe(true);
      expect(isWindowUnfocused(windows[2])).toBe(true);
    });

    const secondWindowBar = windows[1].querySelector(
      '.window-bar'
    ) as HTMLElement;
    await user.click(secondWindowBar);

    await waitFor(() => {
      expect(isWindowUnfocused(windows[0])).toBe(true);
      expect(isWindowFocused(windows[1])).toBe(true);
      expect(isWindowUnfocused(windows[2])).toBe(true);
    });
  });

  it('should close window and maintain focus on remaining windows', async () => {
    const user = userEvent.setup();
    render(<Desktop powerOff={mockPowerOff} />);

    const terminalIcon = screen.getByText('Terminal');

    await user.dblClick(terminalIcon);
    await user.dblClick(terminalIcon);

    await waitFor(() => {
      expect(getWindows().length).toBe(2);
    });

    let windows = getWindows();
    const closeButton = windows[1].querySelector(
      '.bg-carnation'
    ) as HTMLElement;
    await user.click(closeButton);

    await waitFor(() => {
      windows = getWindows();
      expect(windows.length).toBe(1);
    });

    expect(isWindowUnfocused(windows[0])).toBe(true);
  });

  describe('unique app feature', () => {
    it('should allow multiple windows when unique is false', async () => {
      const user = userEvent.setup();
      render(<Desktop powerOff={mockPowerOff} />);

      const terminalIcon = screen.getByText('Terminal');

      await user.dblClick(terminalIcon);
      await waitFor(() => {
        expect(getWindows().length).toBe(1);
      });

      await user.dblClick(terminalIcon);
      await waitFor(() => {
        expect(getWindows().length).toBe(2);
      });
    });

    it('should focus existing window when unique app is double-clicked while a window is unfocused', async () => {
      const user = userEvent.setup();
      render(<Desktop powerOff={mockPowerOff} />);

      const devtoolsIcon = screen.queryByText('Devtools');

      const uniqueAppIcon = devtoolsIcon || screen.getByText('MIM');

      await user.dblClick(uniqueAppIcon);
      await waitFor(() => {
        expect(getWindows().length).toBe(1);
      });

      let windows = getWindows();
      const firstWindowBar = windows[0].querySelector(
        '.window-bar'
      ) as HTMLElement;

      await user.click(firstWindowBar);

      const desktopArea = document.querySelector('.p-5') as HTMLElement;
      await user.click(desktopArea);

      await waitFor(() => {
        expect(isWindowUnfocused(windows[0])).toBe(true);
      });

      await user.dblClick(uniqueAppIcon);

      await waitFor(() => {
        windows = getWindows();
        expect(windows.length).toBe(1);
        expect(isWindowFocused(windows[0])).toBe(true);
      });
    });

    it('should open a new window when unique app is first launched', async () => {
      const user = userEvent.setup();
      render(<Desktop powerOff={mockPowerOff} />);

      const mimIcon = screen.getByText('MIM');

      await user.dblClick(mimIcon);

      await waitFor(() => {
        const windows = getWindows();
        expect(windows.length).toBe(1);
        expect(isWindowFocused(windows[0])).toBe(true);
      });
    });
  });
});
