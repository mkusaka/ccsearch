import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SessionItem } from './SessionItem';
import type { ClaudeSession } from '../types/api';

// Mock data
const mockSession: ClaudeSession = {
  id: 'session-123',
  messages: [
    {
      role: 'user',
      content: 'Hello Claude',
      timestamp: '2024-01-01T00:00:00Z',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      timestamp: '2024-01-01T00:00:01Z',
    },
  ],
  metadata: {
    created_at: '2024-01-01T00:00:00.000Z',
    last_updated: '2024-01-01T00:00:01.000Z',
    total_messages: 2,
  },
};

describe('SessionItem', () => {
  const renderSessionItem = (props: Partial<Parameters<typeof SessionItem>[0]> = {}) => {
    return render(
      <BrowserRouter>
        <SessionItem
          session={mockSession}
          {...props}
        />
      </BrowserRouter>
    );
  };

  test('renders session without crashing', () => {
    renderSessionItem();

    // Check the title is rendered
    expect(screen.getByTitle('Hello Claude')).toBeInTheDocument();
  });

  test('handles missing content gracefully using extractMessageContent', () => {
    const sessionWithVariousFormats = {
      ...mockSession,
      messages: [
        // Standard content
        {
          role: 'user' as const,
          content: 'Standard content',
          timestamp: '2024-01-01T00:00:00Z',
        },
        // Text field fallback
        {
          role: 'assistant' as const,
          text: 'Text field fallback',
          timestamp: '2024-01-01T00:00:01Z',
        } as any,
        // Array format
        {
          role: 'user' as const,
          message: {
            content: [
              { type: 'text', text: 'Array part 1' },
              { type: 'text', text: 'Array part 2' },
            ],
          },
          timestamp: '2024-01-01T00:00:02Z',
        } as any,
        // Empty/undefined content - should be filtered out
        {
          role: 'assistant' as const,
          content: undefined,
          timestamp: '2024-01-01T00:00:03Z',
        } as any,
      ],
    };

    // Should render without crashing despite various content formats
    renderSessionItem({ session: sessionWithVariousFormats });
    
    // The title should use the first user message with content
    expect(screen.getByTitle('Standard content')).toBeInTheDocument();
  });

  test('expands and collapses session details', async () => {
    const user = userEvent.setup();
    renderSessionItem();

    // Find the expand button by class
    const expandButton = screen.getByRole('button', { name: '' });
    expect(expandButton).toHaveClass('expand-button');

    // Check initial state - should show chevron right icon
    const chevronRight = expandButton.querySelector('.lucide-chevron-right');
    expect(chevronRight).toBeInTheDocument();

    // Click to expand
    await user.click(expandButton);

    // Should now show chevron down icon
    const chevronDown = expandButton.querySelector('.lucide-chevron-down');
    expect(chevronDown).toBeInTheDocument();

    // Click to collapse
    await user.click(expandButton);

    // Should show chevron right again
    expect(expandButton.querySelector('.lucide-chevron-right')).toBeInTheDocument();
  });

  test('checkbox is rendered when onSelectionChange is provided', () => {
    const handleSelectionChange = vi.fn();
    
    renderSessionItem({ 
      onSelectionChange: handleSelectionChange 
    });

    // Checkbox should be rendered
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('no checkbox when onSelectionChange is not provided', () => {
    renderSessionItem();

    // Checkbox should not be rendered
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  test('handles undefined content without crashing', () => {
    const sessionWithUndefinedContent = {
      ...mockSession,
      messages: [
        {
          role: 'user' as const,
          content: undefined as any,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          role: 'assistant' as const,
          content: 'Valid content',
          timestamp: '2024-01-01T00:00:01Z',
        },
      ],
    };

    // Should render without crashing
    renderSessionItem({ session: sessionWithUndefinedContent });
    
    // Since first user message has no content, it should show "Untitled Session"
    expect(screen.getByTitle('Untitled Session')).toBeInTheDocument();
  });
});