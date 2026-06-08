import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartButton } from '@/components/SmartButton';
import { SmartLinkButton } from '@/components/SmartLinkButton';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SmartButton', () => {
  test('renders correctly with label', () => {
    render(<SmartButton>Click Me</SmartButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(<SmartButton isLoading>Click Me</SmartButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('fires onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<SmartButton onClick={handleClick}>Click Me</SmartButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('supports Enter key trigger', () => {
    const handleClick = jest.fn();
    render(<SmartButton onClick={handleClick}>Click Me</SmartButton>);
    const button = screen.getByText('Click Me');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });

  test('supports Space key trigger', () => {
    const handleClick = jest.fn();
    render(<SmartButton onClick={handleClick}>Click Me</SmartButton>);
    const button = screen.getByText('Click Me');
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalled();
  });

  test('calls onBeforeNavigate when provided', async () => {
    const onBeforeNavigate = jest.fn().mockResolvedValue(true);
    render(
      <SmartButton onBeforeNavigate={onBeforeNavigate}>Click Me</SmartButton>
    );
    fireEvent.click(screen.getByText('Click Me'));
    await waitFor(() => {
      expect(onBeforeNavigate).toHaveBeenCalled();
    });
  });

  test('displays error when onBeforeNavigate returns false', async () => {
    const onBeforeNavigate = jest.fn().mockResolvedValue(false);
    render(
      <SmartButton 
        onBeforeNavigate={onBeforeNavigate} 
        errorMessage="Validation failed"
      >
        Click Me
      </SmartButton>
    );
    fireEvent.click(screen.getByText('Click Me'));
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });
});

describe('SmartLinkButton', () => {
  test('renders correctly with label', () => {
    render(
      <SmartLinkButton href="/sample">Navigate</SmartLinkButton>
    );
    expect(screen.getByText('Navigate')).toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <SmartLinkButton href="/sample" isLoading>Navigate</SmartLinkButton>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
