import { extractMessageContent } from './extractMessageContent';

describe('extractMessageContent', () => {
  // Edge cases
  test('returns empty string for null', () => {
    expect(extractMessageContent(null)).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(extractMessageContent(undefined)).toBe('');
  });

  test('returns empty string for empty object', () => {
    expect(extractMessageContent({})).toBe('');
  });

  // Direct content field
  test('extracts string content field', () => {
    expect(extractMessageContent({ content: 'Hello world' })).toBe('Hello world');
  });

  test('prioritizes content over other fields', () => {
    expect(extractMessageContent({ 
      content: 'Content text',
      text: 'Text field',
      summary: 'Summary field'
    })).toBe('Content text');
  });

  // Text field
  test('extracts text field when no content', () => {
    expect(extractMessageContent({ text: 'Text message' })).toBe('Text message');
  });

  test('prioritizes text over summary', () => {
    expect(extractMessageContent({ 
      text: 'Text field',
      summary: 'Summary field'
    })).toBe('Text field');
  });

  // Summary field
  test('extracts summary field as last resort', () => {
    expect(extractMessageContent({ summary: 'Summary text' })).toBe('Summary text');
  });

  // Nested message.content - string
  test('extracts nested message.content string', () => {
    expect(extractMessageContent({ 
      message: { content: 'Nested content' }
    })).toBe('Nested content');
  });

  // Nested message.content - array
  test('extracts text from array content', () => {
    expect(extractMessageContent({
      message: {
        content: [
          { type: 'text', text: 'First part' },
          { type: 'text', text: 'Second part' }
        ]
      }
    })).toBe('First part Second part');
  });

  test('filters out non-text array items', () => {
    expect(extractMessageContent({
      message: {
        content: [
          { type: 'text', text: 'Text content' },
          { type: 'tool_use', id: '123', name: 'calculator' },
          { type: 'text', text: 'More text' }
        ]
      }
    })).toBe('Text content More text');
  });

  test('handles array with missing text fields', () => {
    expect(extractMessageContent({
      message: {
        content: [
          { type: 'text', text: 'Valid' },
          { type: 'text' }, // Missing text
          { type: 'other', text: 'Invalid type' }
        ]
      }
    })).toBe('Valid');
  });

  // Type safety
  test('ignores non-string content field', () => {
    expect(extractMessageContent({ content: 123 })).toBe('');
    expect(extractMessageContent({ content: { nested: 'object' } })).toBe('');
  });

  test('ignores non-string text field', () => {
    expect(extractMessageContent({ text: ['array'] })).toBe('');
  });

  // Fallback behavior
  test('returns empty string for unknown format', () => {
    expect(extractMessageContent({ unknown: 'field' })).toBe('');
  });

  test('handles complex nested structures', () => {
    const complex = {
      id: 123,
      metadata: { timestamp: '2024-01-01' },
      data: { foo: 'bar' }
    };
    expect(extractMessageContent(complex)).toBe('');
  });

  // Real-world Claude message formats
  test('handles Claude API message format', () => {
    expect(extractMessageContent({
      role: 'assistant',
      content: 'Claude response'
    })).toBe('Claude response');
  });

  test('handles Claude tool use format', () => {
    expect(extractMessageContent({
      message: {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Let me calculate that.' },
          { type: 'tool_use', id: 'calc_123', name: 'calculator', input: { expression: '2+2' } },
          { type: 'text', text: 'The answer is 4.' }
        ]
      }
    })).toBe('Let me calculate that. The answer is 4.');
  });

  test('handles multimodal content', () => {
    expect(extractMessageContent({
      message: {
        content: [
          { type: 'text', text: 'Here is an image:' },
          { type: 'image', source: { type: 'base64', data: '...' } },
          { type: 'text', text: 'What do you see?' }
        ]
      }
    })).toBe('Here is an image: What do you see?');
  });

  // Empty content handling
  test('returns empty string for empty array content', () => {
    expect(extractMessageContent({
      message: { content: [] }
    })).toBe('');
  });

  test('returns empty string for array with no valid text', () => {
    expect(extractMessageContent({
      message: {
        content: [
          { type: 'tool_use', id: '123' },
          { type: 'image', url: 'http://example.com' }
        ]
      }
    })).toBe('');
  });
});