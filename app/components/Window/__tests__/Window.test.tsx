import { render, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Window from '../Window';

jest.mock('@/app/store/desktopApplicationStore', () => ({
  useDesktopApplicationStore: (
    selector: (state: { setFocusedApp: () => void }) => unknown
  ) => {
    const store = {
      setFocusedApp: jest.fn()
    };
    return selector(store);
  }
}));

jest.mock('@/app/components/applications/Terminal/Terminal', () => {
  return function MockTerminal() {
    return <div data-testid="mock-terminal">Terminal</div>;
  };
});

const createMockParentNode = (width = 1070, height = 835) => {
  const div = document.createElement('div');
  Object.defineProperty(div, 'offsetWidth', {
    get: () => width,
    configurable: true
  });
  Object.defineProperty(div, 'offsetHeight', {
    get: () => height,
    configurable: true
  });
  return div;
};

describe('<Window />', () => {
  const mockUpdateWindows = jest.fn();
  const mockCloseWindow = jest.fn();

  beforeEach(() => {
    mockUpdateWindows.mockClear();
    mockCloseWindow.mockClear();
  });

  const defaultProps = {
    index: 0,
    id: 'window-1',
    name: 'Terminal',
    isFocused: true,
    parentNode: createMockParentNode(),
    windowsCount: 1,
    updateWindows: mockUpdateWindows,
    closeWindow: mockCloseWindow
  };

  describe('Maximize', () => {
    it('should maximize window to fill desktop area with correct dimensions', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      expect(windowElement).toBeTruthy();

      const initialWidth = (windowElement as HTMLElement).style.width;
      expect(initialWidth).not.toBe('1070px');

      const greenButton = document.querySelector('.bg-dull-lime');
      expect(greenButton).toBeTruthy();

      await userEvent.click(greenButton!);

      await waitFor(() => {
        const width = (windowElement as HTMLElement).style.width;
        const height = (windowElement as HTMLElement).style.height;
        expect(width).toBe('1070px');
        expect(height).toBe('835px');
      });
    });

    it('should position maximized window at correct coordinates accounting for padding', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const greenButton = document.querySelector('.bg-dull-lime');

      await userEvent.click(greenButton!);

      await waitFor(() => {
        const transform = (windowElement as HTMLElement).style.transform;
        expect(transform).toBe('translate(-20px,0px)');
      });
    });

    it('should always maximize when clicking green button (no restore)', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const greenButton = document.querySelector('.bg-dull-lime');

      await userEvent.click(greenButton!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe('1070px');
      });

      await userEvent.click(greenButton!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe('1070px');
        expect((windowElement as HTMLElement).style.height).toBe('835px');
      });
    });

    it('should maximize when double-clicking window header', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const windowBar = document.querySelector('.window-bar');

      expect(windowBar).toBeTruthy();

      await userEvent.dblClick(windowBar!);

      await waitFor(() => {
        const width = (windowElement as HTMLElement).style.width;
        const height = (windowElement as HTMLElement).style.height;
        expect(width).toBe('1070px');
        expect(height).toBe('835px');
      });
    });

    it('should restore when double-clicking window header while maximized', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const windowBar = document.querySelector('.window-bar');

      const initialWidth = (windowElement as HTMLElement).style.width;

      await userEvent.dblClick(windowBar!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe('1070px');
      });

      await userEvent.dblClick(windowBar!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe(initialWidth);
      });
    });

    it('should not maximize when double-clicking window buttons', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const greenButton = document.querySelector('.bg-dull-lime');

      const initialWidth = (windowElement as HTMLElement).style.width;

      fireEvent.doubleClick(greenButton!);

      await waitFor(
        () => {
          expect((windowElement as HTMLElement).style.width).toBe(initialWidth);
        },
        { timeout: 500 }
      );
    });
  });

  describe('Resize East (Right Edge)', () => {
    it('should increase width when dragging east handle to the right', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);

      const eastHandle = document.querySelector(
        '.cursor-ew-resize.right-0'
      ) as HTMLElement;
      expect(eastHandle).toBeTruthy();

      fireEvent.mouseDown(eastHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        expect(newWidth).toBeGreaterThan(initialWidth);
        expect(newWidth).toBe(initialWidth + 100);
      });
    });

    it('should respect minimum width constraint', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const eastHandle = document.querySelector(
        '.cursor-ew-resize.right-0'
      ) as HTMLElement;

      fireEvent.mouseDown(eastHandle, { clientX: 800, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const width = parseInt((windowElement as HTMLElement).style.width);
        expect(width).toBeGreaterThanOrEqual(700);
      });
    });

    it('should reset maximize state when resizing manually', async () => {
      const parentNode = createMockParentNode(1070, 835);
      render(<Window {...defaultProps} parentNode={parentNode} />);

      const windowElement = document.querySelector('.react-draggable');
      const windowBar = document.querySelector('.window-bar');

      fireEvent.doubleClick(windowBar!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe('1070px');
      });

      const eastHandle = document.querySelector(
        '.cursor-ew-resize.right-0'
      ) as HTMLElement;

      fireEvent.mouseDown(eastHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const width = parseInt((windowElement as HTMLElement).style.width);
        expect(width).toBeGreaterThan(1070);
      });

      fireEvent.doubleClick(windowBar!);

      await waitFor(() => {
        expect((windowElement as HTMLElement).style.width).toBe('1070px');
      });
    });
  });

  describe('Resize South (Bottom Edge)', () => {
    it('should increase height when dragging south handle downward', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );

      const southHandle = document.querySelector(
        '.cursor-ns-resize.bottom-0'
      ) as HTMLElement;
      expect(southHandle).toBeTruthy();

      fireEvent.mouseDown(southHandle, { clientX: 100, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 300 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newHeight).toBeGreaterThan(initialHeight);
        expect(newHeight).toBe(initialHeight + 100);
      });
    });

    it('should respect minimum height constraint', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const southHandle = document.querySelector(
        '.cursor-ns-resize.bottom-0'
      ) as HTMLElement;

      fireEvent.mouseDown(southHandle, { clientX: 100, clientY: 500 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const height = parseInt((windowElement as HTMLElement).style.height);
        expect(height).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('Resize West (Left Edge)', () => {
    it('should increase width and adjust position when dragging west handle to the left', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);
      const initialTransform = (windowElement as HTMLElement).style.transform;
      const initialX = parseInt(
        initialTransform.match(/translate\((-?\d+)/)?.[1] || '0'
      );

      const westHandle = document.querySelector(
        '.cursor-ew-resize.left-0'
      ) as HTMLElement;
      expect(westHandle).toBeTruthy();

      fireEvent.mouseDown(westHandle, { clientX: 200, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        expect(newWidth).toBeGreaterThan(initialWidth);
        expect(newWidth).toBe(initialWidth + 100);

        const transform = (windowElement as HTMLElement).style.transform;
        const newX = parseInt(
          transform.match(/translate\((-?\d+)/)?.[1] || '0'
        );
        expect(newX).toBeLessThan(initialX);
      });
    });
  });

  describe('Resize North (Top Edge)', () => {
    it('should increase height and adjust position when dragging north handle upward', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );
      const initialTransform = (windowElement as HTMLElement).style.transform;
      const initialY = parseInt(
        initialTransform.match(/translate\(-?\d+px, (-?\d+)/)?.[1] || '0'
      );

      const northHandle = document.querySelector(
        '.cursor-ns-resize.top-0'
      ) as HTMLElement;
      expect(northHandle).toBeTruthy();

      fireEvent.mouseDown(northHandle, { clientX: 100, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newHeight).toBeGreaterThan(initialHeight);
        expect(newHeight).toBe(initialHeight + 100);

        const transform = (windowElement as HTMLElement).style.transform;
        const newY = parseInt(
          transform.match(/translate\(-?\d+px, (-?\d+)/)?.[1] || '0'
        );
        expect(newY).toBeLessThanOrEqual(initialY);
      });
    });
  });

  describe('Resize Southeast (Bottom-Right Corner)', () => {
    it('should increase both width and height when dragging southeast handle', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );

      const seHandle = document.querySelector(
        '.cursor-nwse-resize.bottom-0.right-0'
      ) as HTMLElement;
      expect(seHandle).toBeTruthy();

      fireEvent.mouseDown(seHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 250 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newWidth).toBe(initialWidth + 100);
        expect(newHeight).toBe(initialHeight + 150);
      });
    });
  });

  describe('Resize Northwest (Top-Left Corner)', () => {
    it('should increase both dimensions and adjust position when dragging northwest handle', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );

      const nwHandle = document.querySelector(
        '.cursor-nwse-resize.top-0.left-0'
      ) as HTMLElement;
      expect(nwHandle).toBeTruthy();

      fireEvent.mouseDown(nwHandle, { clientX: 200, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newWidth).toBe(initialWidth + 100);
        expect(newHeight).toBe(initialHeight + 100);
      });
    });
  });

  describe('Resize Northeast (Top-Right Corner)', () => {
    it('should increase width, increase height, and adjust Y position', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );

      const neHandle = document.querySelector(
        '.cursor-nesw-resize.top-0.right-0'
      ) as HTMLElement;
      expect(neHandle).toBeTruthy();

      fireEvent.mouseDown(neHandle, { clientX: 100, clientY: 200 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newWidth).toBe(initialWidth + 100);
        expect(newHeight).toBe(initialHeight + 100);
      });
    });
  });

  describe('Resize Southwest (Bottom-Left Corner)', () => {
    it('should increase height, increase width, and adjust X position', async () => {
      render(<Window {...defaultProps} />);

      const windowElement = document.querySelector('.react-draggable');
      const initialWidth = parseInt((windowElement as HTMLElement).style.width);
      const initialHeight = parseInt(
        (windowElement as HTMLElement).style.height
      );

      const swHandle = document.querySelector(
        '.cursor-nesw-resize.bottom-0.left-0'
      ) as HTMLElement;
      expect(swHandle).toBeTruthy();

      fireEvent.mouseDown(swHandle, { clientX: 200, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
      fireEvent.mouseUp(document);

      await waitFor(() => {
        const newWidth = parseInt((windowElement as HTMLElement).style.width);
        const newHeight = parseInt((windowElement as HTMLElement).style.height);
        expect(newWidth).toBe(initialWidth + 100);
        expect(newHeight).toBe(initialHeight + 100);
      });
    });
  });
});
