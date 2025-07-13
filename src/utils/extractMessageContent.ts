interface MessageWithContent {
  content?: string;
  text?: string;
  summary?: string;
  message?: {
    content?: string | Array<{
      type: string;
      text?: string;
      content?: string;
    }>;
  };
}

export function extractMessageContent(message: MessageWithContent | null | undefined): string {
  if (!message) return '';
  
  // Direct string fields
  if (message.content && typeof message.content === 'string') return message.content;
  if (message.text && typeof message.text === 'string') return message.text;
  if (message.summary && typeof message.summary === 'string') return message.summary;
  
  // Nested message.content
  if (message.message?.content) {
    if (typeof message.message.content === 'string') {
      return message.message.content;
    }
    if (Array.isArray(message.message.content)) {
      return message.message.content
        .filter((item) => item?.type === 'text' && item?.text)
        .map((item) => item.text || '')
        .join(' ');
    }
  }
  
  // Fallback
  return '';
}