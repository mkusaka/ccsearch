import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionItem } from './SessionItem'
import type { ClaudeSession } from '../types/api'

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
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:01.000Z',
  filepath: '/path/to/session.jsonl',
}

describe('SessionItem', () => {
  const renderSessionItem = (props: Partial<Parameters<typeof SessionItem>[0]> = {}) => {
    return render(
      <BrowserRouter>
        <SessionItem session={mockSession} {...props} />
      </BrowserRouter>,
    )
  }

  test('renders session title correctly', () => {
    renderSessionItem()

    // Should show the first user message as title
    expect(screen.getByTitle('Hello Claude')).toBeInTheDocument()
  })

  test('handles empty messages gracefully', () => {
    const sessionWithEmptyMessages: ClaudeSession = {
      ...mockSession,
      messages: [],
    }

    renderSessionItem({ session: sessionWithEmptyMessages })

    // Should show default title when no messages
    expect(screen.getByTitle('Untitled Session')).toBeInTheDocument()
  })

  test('expands and collapses session details', async () => {
    const user = userEvent.setup()
    renderSessionItem()

    // Find the expand button by class
    const expandButton = screen.getByRole('button', { name: '' })
    expect(expandButton).toHaveClass('expand-button')

    // Check initial state - should show chevron right icon
    const chevronRight = expandButton.querySelector('.lucide-chevron-right')
    expect(chevronRight).toBeInTheDocument()

    // Click to expand
    await user.click(expandButton)

    // Should now show chevron down icon
    const chevronDown = expandButton.querySelector('.lucide-chevron-down')
    expect(chevronDown).toBeInTheDocument()

    // Click to collapse
    await user.click(expandButton)

    // Should show chevron right again
    expect(expandButton.querySelector('.lucide-chevron-right')).toBeInTheDocument()
  })

  test('checkbox is rendered when onSelectionChange is provided', () => {
    const handleSelectionChange = vi.fn()

    renderSessionItem({
      onSelectionChange: handleSelectionChange,
    })

    // Checkbox should be rendered
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  test('no checkbox when onSelectionChange is not provided', () => {
    renderSessionItem()

    // Checkbox should not be rendered
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  test('filters out tool calls and system messages', () => {
    const sessionWithToolCalls: ClaudeSession = {
      ...mockSession,
      messages: [
        {
          role: 'user',
          content: 'Calculate 2+2',
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          role: 'assistant',
          content: '<function_calls>\n<invoke name="calculator">\n</invoke>\n</function_calls>',
          timestamp: '2024-01-01T00:00:01Z',
        },
        {
          role: 'assistant',
          content: 'The answer is 4.',
          timestamp: '2024-01-01T00:00:02Z',
        },
      ],
    }

    renderSessionItem({ session: sessionWithToolCalls })

    // Title should be from user message
    expect(screen.getByTitle('Calculate 2+2')).toBeInTheDocument()

    // Preview should not show function calls
    expect(screen.queryByText(/<function_calls>/)).not.toBeInTheDocument()
  })
})
