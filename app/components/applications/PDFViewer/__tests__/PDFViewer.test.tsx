import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PDFViewer from '../PDFViewer';

describe('<PDFViewer />', () => {
  it('should zoom in when zoom in button is clicked', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText('Zoom percentage');
    expect(zoomInput).toHaveValue('100');

    const zoomInButton = screen.getByLabelText('Zoom in');
    await userEvent.click(zoomInButton);

    expect(zoomInput).toHaveValue('110');
  });

  it('should zoom out when zoom out button is clicked', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText('Zoom percentage');
    expect(zoomInput).toHaveValue('100');

    const zoomOutButton = screen.getByLabelText('Zoom out');
    await userEvent.click(zoomOutButton);

    expect(zoomInput).toHaveValue('90');
  });

  it('should not zoom below 50%', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText('Zoom percentage');
    const zoomOutButton = screen.getByLabelText('Zoom out');

    // click zoom out 6 times to try to go below 50%
    for (let i = 0; i < 6; i++) {
      await userEvent.click(zoomOutButton);
    }

    expect(zoomInput).toHaveValue('50');
  });

  it('should not zoom above 300%', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText('Zoom percentage');
    const zoomInButton = screen.getByLabelText('Zoom in');

    // click zoom in 21 times to try to go above 300%
    for (let i = 0; i < 21; i++) {
      await userEvent.click(zoomInButton);
    }

    expect(zoomInput).toHaveValue('300');
  });

  it('should allow manual zoom percentage input', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;
    expect(zoomInput).toHaveValue('100');

    await userEvent.clear(zoomInput);
    await userEvent.type(zoomInput, '150');
    await userEvent.keyboard('{Enter}');

    expect(zoomInput).toHaveValue('150');
  });

  it('should reset to last valid value when manual input is below minimum', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;

    await userEvent.clear(zoomInput);
    await userEvent.type(zoomInput, '30');
    await userEvent.keyboard('{Enter}');

    expect(zoomInput).toHaveValue('100');
  });

  it('should reset to last valid value when manual input is above maximum', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;

    await userEvent.clear(zoomInput);
    await userEvent.type(zoomInput, '400');
    await userEvent.keyboard('{Enter}');

    expect(zoomInput).toHaveValue('100');
  });

  it('should reset to last valid value when manual input is not a number', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;

    await userEvent.clear(zoomInput);
    await userEvent.keyboard('{Enter}');

    expect(zoomInput).toHaveValue('100');
  });

  it('should only allow numeric characters in zoom input', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;

    await userEvent.clear(zoomInput);
    await userEvent.type(zoomInput, 'abc123xyz');

    expect(zoomInput).toHaveValue('123');
  });

  it('should apply manual zoom on blur', async () => {
    render(<PDFViewer height={600} />);

    const zoomInput = screen.getByLabelText(
      'Zoom percentage'
    ) as HTMLInputElement;
    const zoomInButton = screen.getByLabelText('Zoom in');

    await userEvent.clear(zoomInput);
    await userEvent.type(zoomInput, '200');
    await userEvent.click(zoomInButton);

    expect(zoomInput).toHaveValue('210');
  });
});
